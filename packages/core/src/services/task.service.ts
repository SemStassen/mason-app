import { and, eq, inArray, sql } from "@mason/db/operators";
import { type DbTask, tasksTable } from "@mason/db/schema";
import { Effect, Schema } from "effect";
import { ProjectId, TaskId, type WorkspaceId } from "../models/ids";
import {
  Task,
  type TaskToCreate,
  type TaskToUpdate,
} from "../models/task.model";
import { createDomainEntities, updateDomainEntities } from "./crud-helpers";
import { DatabaseService } from "./db.service";

export class TasksService extends Effect.Service<TasksService>()(
  "@mason/core/tasksService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DatabaseService;

      const createTasks = ({
        workspaceId,
        tasks,
      }: {
        workspaceId: typeof WorkspaceId.Type;
        tasks: Array<typeof TaskToCreate.Type>;
      }) =>
        createDomainEntities({
          entityName: "Task",
          inputs: tasks,
          toDomain: (input) => Task.makeFromCreate(input, workspaceId),
          saveBatch: (entities) =>
            db.use(workspaceId, (conn) =>
              conn.insert(tasksTable).values(entities).returning()
            ),
          fromDb: (dbRecord) => Task.makeFromDb(dbRecord),
        });

      const updateTasks = ({
        workspaceId,
        tasks,
      }: {
        workspaceId: typeof WorkspaceId.Type;
        tasks: Array<typeof TaskToUpdate.Type>;
      }) =>
        updateDomainEntities({
          entityName: "Task",
          inputs: tasks,
          fetchExisting: (ids) =>
            db.use(workspaceId, (conn) =>
              conn.query.tasksTable.findMany({
                where: ({ id }) => inArray(id, ids),
              })
            ),
          toDomain: (update, existing) => Task.makeFromUpdate(update, existing),
          fromDb: (dbRecord) => Task.makeFromDb(dbRecord),
          saveUpdates: (entities) =>
            db.withTransaction(
              Effect.gen(function* () {
                const results: Array<DbTask> = [];

                for (const entity of entities) {
                  const [updated] = yield* db.use(workspaceId, (conn) =>
                    conn
                      .update(tasksTable)
                      .set(entity)
                      .where(
                        and(
                          eq(tasksTable.workspaceId, workspaceId),
                          eq(tasksTable.id, entity.id)
                        )
                      )
                      .returning()
                  );
                  results.push(updated);
                }

                return results;
              })
            ),
        });

      return {
        createTasks: createTasks,
        updateTasks: updateTasks,
        softDeleteTasks: ({
          workspaceId,
          taskIds,
        }: {
          workspaceId: typeof WorkspaceId.Type;
          taskIds: Array<typeof TaskId.Type>;
        }) =>
          Effect.gen(function* () {
            if (!taskIds.length) {
              yield* Effect.logDebug("softDeleteTasks: 0 supplied");
              return [];
            }

            return yield* db.use(workspaceId, (conn) =>
              conn
                .update(tasksTable)
                .set({ deletedAt: new Date() })
                .where(
                  and(
                    eq(tasksTable.workspaceId, workspaceId),
                    inArray(tasksTable.id, taskIds)
                  )
                )
            );
          }),
        hardDeleteTasks: ({
          workspaceId,
          taskIds,
        }: {
          workspaceId: typeof WorkspaceId.Type;
          taskIds: Array<typeof TaskId.Type>;
        }) =>
          Effect.gen(function* () {
            if (!taskIds.length) {
              yield* Effect.logDebug("hardDeleteTasks: 0 supplied");
              return [];
            }
            return yield* db.use(workspaceId, (conn) =>
              conn
                .delete(tasksTable)
                .where(
                  and(
                    eq(tasksTable.workspaceId, workspaceId),
                    inArray(tasksTable.id, taskIds)
                  )
                )
            );
          }),
        listTasks: ({
          workspaceId,
          query,
        }: {
          workspaceId: typeof WorkspaceId.Type;
          query?: {
            projectIds?: Array<typeof ProjectId.Type>;
            _source?: "float";
          };
        }) =>
          Effect.gen(function* () {
            const whereConditions = [
              eq(tasksTable.workspaceId, workspaceId),
              query?.projectIds
                ? inArray(tasksTable.projectId, query.projectIds)
                : undefined,
              query?._source
                ? and(
                    sql`${tasksTable._metadata}->>'source' = ${query._source}`,
                    sql`${tasksTable._metadata}->>'externalId' IS NOT NULL`
                  )
                : undefined,
            ].filter(Boolean);

            const dbTasks = yield* db.use(workspaceId, (conn) =>
              conn.query.tasksTable.findMany({
                where: and(...whereConditions),
              })
            );

            const tasks = yield* Effect.all(
              dbTasks.map((t) => Task.makeFromDb(t))
            );

            return tasks;
          }),
      };
    }),
  }
) {}
