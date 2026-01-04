import { SqlSchema } from "@effect/sql";
import { and, eq, inArray, isNotNull, sql } from "@mason/db/operators";
import { type DbTask, tasksTable } from "@mason/db/schema";
import { DatabaseService } from "@mason/db/service";
import {
  DatabaseError,
  ExistingTaskId,
  ExistingWorkspaceId,
  ProjectId,
  TaskId,
} from "@mason/framework";
import { Context, DateTime, Effect, Layer, Option, Schema } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import { Task } from "../domain";

const _mapToDb = (
  task: typeof Task.Task.Encoded
): Omit<DbTask, "createdAt" | "updatedAt"> => ({
  id: task.id,
  workspaceId: task.workspaceId,
  projectId: task.projectId,
  name: task.name,
  _metadata: Option.getOrNull(task._metadata),
  deletedAt: Option.getOrNull(Option.map(task.deletedAt, DateTime.toDate)),
});

export class TaskRepository extends Context.Tag(
  "@mason/project/TaskRepository"
)<
  TaskRepository,
  {
    insert: (
      tasks: NonEmptyReadonlyArray<Task.Task>
    ) => Effect.Effect<ReadonlyArray<Task.Task>, DatabaseError>;
    update: (
      tasks: NonEmptyReadonlyArray<Task.Task>
    ) => Effect.Effect<ReadonlyArray<Task.Task>, DatabaseError>;
    hardDelete: (
      taskIds: NonEmptyReadonlyArray<ExistingTaskId>
    ) => Effect.Effect<void, DatabaseError>;
    list: (params: {
      workspaceId: ExistingWorkspaceId;
      query?: {
        ids?: ReadonlyArray<TaskId>;
        projectIds?: ReadonlyArray<ProjectId>;
        _source?: "float";
        _externalIds?: ReadonlyArray<string>;
        _includeDeleted?: boolean;
      };
    }) => Effect.Effect<ReadonlyArray<Task.Task>, DatabaseError>;
  }
>() {
  static readonly live = Layer.effect(
    TaskRepository,
    Effect.gen(function* () {
      const db = yield* DatabaseService;

      // --- Mutations / Commands ---
      const InsertTasks = SqlSchema.findAll({
        Request: Schema.NonEmptyArray(Task.Task),
        Result: Task.Task,
        execute: (tasks) =>
          db.drizzle.insert(tasksTable).values(tasks.map(_mapToDb)).returning(),
      });

      const UpdateTasks = SqlSchema.findAll({
        Request: Schema.NonEmptyArray(Task.Task),
        Result: Task.Task,
        execute: (tasks) =>
          Effect.forEach(
            tasks,
            (task) =>
              db.drizzle
                .update(tasksTable)
                .set(_mapToDb(task))
                .where(eq(tasksTable.id, task.id))
                .returning(),
            { concurrency: 5 }
          ).pipe(Effect.map((r) => r.flat())),
      });

      const HardDeleteTasks = SqlSchema.void({
        Request: Schema.NonEmptyArray(ExistingTaskId),
        execute: (taskIds) =>
          db.drizzle.delete(tasksTable).where(inArray(tasksTable.id, taskIds)),
      });

      // --- Queries ---
      const ListTasks = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: ExistingWorkspaceId,
          query: Schema.optional(
            Schema.Struct({
              ids: Schema.optional(Schema.Array(TaskId)),
              projectIds: Schema.optional(Schema.Array(ProjectId)),
              _source: Schema.optional(Schema.Literal("float")),
              _externalIds: Schema.optional(Schema.Array(Schema.String)),
              _includeDeleted: Schema.optional(Schema.Boolean),
            })
          ),
        }),
        Result: Task.Task,
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
            query?._includeDeleted
              ? undefined
              : isNotNull(tasksTable.deletedAt),
          ].filter(Boolean);

          return db.drizzle.query.tasksTable.findMany({
            where: and(...whereConditions),
          });
        },
      });

      return TaskRepository.of({
        insert: Effect.fn("@mason/project/TaskRepo.insert")((tasks) =>
          InsertTasks(tasks).pipe(
            Effect.mapError((e) => new DatabaseError({ cause: e }))
          )
        ),

        update: Effect.fn("@mason/project/TaskRepo.update")((tasks) =>
          UpdateTasks(tasks).pipe(
            Effect.mapError((e) => new DatabaseError({ cause: e }))
          )
        ),

        hardDelete: Effect.fn("@mason/project/TaskRepo.hardDelete")((taskIds) =>
          HardDeleteTasks(taskIds).pipe(
            Effect.mapError((e) => new DatabaseError({ cause: e }))
          )
        ),

        list: Effect.fn("@mason/project/TaskRepo.list")((params) =>
          ListTasks(params).pipe(
            Effect.mapError((e) => new DatabaseError({ cause: e }))
          )
        ),
      });
    })
  );
}
