import { SqlSchema } from "@effect/sql";
import { and, eq, inArray, sql } from "@mason/db/operators";
import { tasksTable } from "@mason/db/schema";
import { DatabaseService } from "@mason/db/service";
import type { RepositoryError } from "@mason/framework/errors/database";
import { ProjectId, TaskId, WorkspaceId } from "@mason/framework/types/ids";
import { Context, Effect, Layer, Schema } from "effect";
import { Task } from "../models/task.model";

export class TaskRepository extends Context.Tag(
  "@mason/project/TaskRepository"
)<
  TaskRepository,
  {
    insert: (params: {
      workspaceId: WorkspaceId;
      tasks: Array<Task>;
    }) => Effect.Effect<ReadonlyArray<Task>, RepositoryError>;
    update: (params: {
      workspaceId: WorkspaceId;
      tasks: Array<Task>;
    }) => Effect.Effect<ReadonlyArray<Task>, RepositoryError>;
    softDelete: (params: {
      workspaceId: WorkspaceId;
      taskIds: Array<TaskId>;
    }) => Effect.Effect<void, RepositoryError>;
    hardDelete: (params: {
      workspaceId: WorkspaceId;
      taskIds: Array<TaskId>;
    }) => Effect.Effect<void, RepositoryError>;
    list: (params: {
      workspaceId: WorkspaceId;
      query?: {
        ids?: Array<TaskId>;
        projectIds?: Array<ProjectId>;
        _source?: "float";
        _externalIds?: Array<string>;
      };
    }) => Effect.Effect<ReadonlyArray<Task>, RepositoryError>;
  }
>() {
  static readonly live = Layer.effect(
    TaskRepository,
    Effect.gen(function* () {
      const db = yield* DatabaseService;

      // --- Mutations / Commands ---
      const InsertTasks = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: WorkspaceId,
          tasks: Schema.Array(Task),
        }),
        Result: Task,
        execute: ({ workspaceId, tasks }) =>
          db.drizzle
            .insert(tasksTable)
            .values(tasks.map((task) => ({ ...task, workspaceId })))
            .returning(),
      });

      const UpdateTasks = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: WorkspaceId,
          tasks: Schema.Array(Task),
        }),
        Result: Task,
        execute: ({ workspaceId, tasks }) =>
          Effect.forEach(
            tasks,
            (task) =>
              db.drizzle
                .update(tasksTable)
                .set(task)
                .where(
                  and(
                    eq(tasksTable.workspaceId, workspaceId),
                    eq(tasksTable.id, task.id)
                  )
                )
                .returning(),
            { concurrency: 5 }
          ).pipe(Effect.map((r) => r.flat())),
      });

      const SoftDeleteTasks = SqlSchema.void({
        Request: Schema.Struct({
          workspaceId: WorkspaceId,
          taskIds: Schema.Array(TaskId),
        }),
        execute: ({ workspaceId, taskIds }) =>
          db.drizzle
            .update(tasksTable)
            .set({ deletedAt: new Date() })
            .where(
              and(
                eq(tasksTable.workspaceId, workspaceId),
                inArray(tasksTable.id, taskIds)
              )
            ),
      });

      const HardDeleteTasks = SqlSchema.void({
        Request: Schema.Struct({
          workspaceId: WorkspaceId,
          taskIds: Schema.Array(TaskId),
        }),
        execute: ({ workspaceId, taskIds }) =>
          db.drizzle
            .delete(tasksTable)
            .where(
              and(
                eq(tasksTable.workspaceId, workspaceId),
                inArray(tasksTable.id, taskIds)
              )
            ),
      });

      // --- Queries ---
      const ListTasks = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: WorkspaceId,
          query: Schema.optional(
            Schema.Struct({
              ids: Schema.optional(Schema.Array(TaskId)),
              projectIds: Schema.optional(Schema.Array(ProjectId)),
              _source: Schema.optional(Schema.Literal("float")),
              _externalIds: Schema.optional(Schema.Array(Schema.String)),
            })
          ),
        }),
        Result: Task,
        execute: ({ workspaceId, query }) => {
          const whereConditions = [
            eq(tasksTable.workspaceId, workspaceId),
            query?.ids ? inArray(tasksTable.id, query.ids) : undefined,
            query?.projectIds
              ? inArray(tasksTable.projectId, query.projectIds)
              : undefined,
            query?._source
              ? and(
                  sql`${tasksTable._metadata}->>'source' = ${query._source}`,
                  sql`${tasksTable._metadata}->>'externalId' IS NOT NULL`
                )
              : undefined,
            query?._externalIds?.length
              ? sql`${tasksTable._metadata}->>'externalId' IN (${sql.join(
                  query._externalIds.map((id) => sql`${id}`),
                  sql`, `
                )})`
              : undefined,
          ].filter(Boolean);

          return db.drizzle.query.tasksTable.findMany({
            where: and(...whereConditions),
          });
        },
      });

      return TaskRepository.of({
        insert: Effect.fn("@mason/project/TaskRepo.insert")(
          ({ workspaceId, tasks }) =>
            db.withWorkspace(workspaceId, InsertTasks({ workspaceId, tasks }))
        ),

        update: Effect.fn("@mason/project/TaskRepo.update")(
          ({ workspaceId, tasks }) =>
            db.withWorkspace(workspaceId, UpdateTasks({ workspaceId, tasks }))
        ),

        softDelete: Effect.fn("@mason/project/TaskRepo.softDelete")(
          ({ workspaceId, taskIds }) =>
            db.withWorkspace(
              workspaceId,
              SoftDeleteTasks({ workspaceId, taskIds })
            )
        ),

        hardDelete: Effect.fn("@mason/project/TaskRepo.hardDelete")(
          ({ workspaceId, taskIds }) =>
            db.withWorkspace(
              workspaceId,
              HardDeleteTasks({ workspaceId, taskIds })
            )
        ),

        list: Effect.fn("@mason/project/TaskRepo.list")(
          ({ workspaceId, query }) =>
            db.withWorkspace(workspaceId, ListTasks({ workspaceId, query }))
        ),
      });
    })
  );
}
