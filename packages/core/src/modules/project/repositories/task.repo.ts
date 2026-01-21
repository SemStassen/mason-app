import { SqlSchema } from "@effect/sql";
import { DrizzleService, schema } from "@mason/db";
import { and, eq, inArray, isNull, type SQL } from "drizzle-orm";
import { Context, DateTime, Effect, Layer, Option, Schema } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/infra/db";
import { wrapSqlError } from "~/infra/db";
import { type ProjectId, type TaskId, WorkspaceId } from "~/shared/schemas";
import { Task } from "../domain/task.model";

/**
 * Schema representing a database row from the tasks table.
 * Includes all fields including metadata (createdAt, updatedAt, archivedAt).
 */
const TaskDbRow = Schema.Struct({
  id: Schema.String,
  workspaceId: Schema.String,
  projectId: Schema.String,
  name: Schema.String,
  archivedAt: Schema.NullOr(Schema.Date),
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
});
type TaskDbRow = typeof TaskDbRow.Type;

/**
 * Convert database row to Task domain entity.
 * Pure function - no Effect wrapping needed.
 */
const rowToTask = (row: TaskDbRow): Task =>
  Schema.decodeUnknownSync(Task)({
    id: row.id,
    workspaceId: row.workspaceId,
    projectId: row.projectId,
    name: row.name,
    archivedAt: Option.fromNullable(row.archivedAt),
  });

/**
 * Maps domain model to database format (Option<Date> -> Date | null).
 */
const taskToDb = (task: typeof Task.Encoded) => ({
  id: task.id,
  workspaceId: task.workspaceId,
  projectId: task.projectId,
  name: task.name,
  archivedAt: Option.getOrNull(Option.map(task.archivedAt, DateTime.toDate)),
});

export class TaskRepository extends Context.Tag(
  "@mason/project/TaskRepository"
)<
  TaskRepository,
  {
    insert: (params: {
      tasks: NonEmptyReadonlyArray<Task>;
    }) => Effect.Effect<ReadonlyArray<Task>, DatabaseError>;
    update: (params: {
      workspaceId: WorkspaceId;
      tasks: NonEmptyReadonlyArray<Task>;
    }) => Effect.Effect<ReadonlyArray<Task>, DatabaseError>;
    retrieve: (params: {
      workspaceId: WorkspaceId;
      query: {
        id: TaskId;
      };
    }) => Effect.Effect<Option.Option<Task>, DatabaseError>;
    list: (params: {
      workspaceId: WorkspaceId;
      query: {
        ids?: ReadonlyArray<TaskId>;
        projectId?: ProjectId;
      };
    }) => Effect.Effect<ReadonlyArray<Task>, DatabaseError>;
  }
>() {
  static readonly live = Layer.effect(
    TaskRepository,
    Effect.gen(function* () {
      const drizzle = yield* DrizzleService;

      const insertQuery = SqlSchema.findAll({
        Request: Schema.Struct({
          tasks: Schema.Array(Task),
        }),
        Result: TaskDbRow,
        execute: (request) =>
          drizzle
            .insert(schema.tasksTable)
            .values(request.tasks.map(taskToDb))
            .returning()
            .execute(),
      });

      const updateQuery = SqlSchema.findAll({
        Request: Schema.Struct({ workspaceId: WorkspaceId, task: Task.model }),
        Result: TaskDbRow,
        execute: (request) =>
          drizzle
            .update(schema.tasksTable)
            .set(taskToDb(request.task))
            .where(
              and(
                eq(schema.tasksTable.id, request.task.id),
                eq(schema.tasksTable.workspaceId, request.workspaceId)
              )
            )
            .returning()
            .execute(),
      });

      const retrieveQuery = SqlSchema.findOne({
        Request: Schema.Struct({
          workspaceId: Schema.String,
          id: Schema.String,
        }),
        Result: TaskDbRow,
        execute: (request) =>
          drizzle
            .select()
            .from(schema.tasksTable)
            .where(
              and(
                eq(schema.tasksTable.workspaceId, request.workspaceId),
                eq(schema.tasksTable.id, request.id)
              )
            )
            .limit(1)
            .execute(),
      });

      const listQuery = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: Schema.String,
          ids: Schema.optional(Schema.Array(Schema.String)),
          projectId: Schema.optional(Schema.String),
        }),
        Result: TaskDbRow,
        execute: (request) => {
          const whereConditions: Array<SQL> = [
            eq(schema.tasksTable.workspaceId, request.workspaceId),
            isNull(schema.tasksTable.archivedAt),
          ];

          if (request.ids && request.ids.length > 0) {
            whereConditions.push(inArray(schema.tasksTable.id, request.ids));
          }

          if (request.projectId) {
            whereConditions.push(
              eq(schema.tasksTable.projectId, request.projectId)
            );
          }

          return drizzle
            .select()
            .from(schema.tasksTable)
            .where(and(...whereConditions))
            .execute();
        },
      });

      return TaskRepository.of({
        insert: Effect.fn("@mason/project/TaskRepo.insert")(function* ({
          tasks,
        }) {
          const rows = yield* insertQuery({ tasks });

          return rows.map(rowToTask);
        }, wrapSqlError),

        update: Effect.fn("@mason/project/TaskRepo.update")(function* ({
          workspaceId,
          tasks,
        }) {
          const results = yield* Effect.forEach(
            tasks,
            (task) => updateQuery({ workspaceId, task }),
            { concurrency: 5 }
          );

          return results.flat().map(rowToTask);
        }, wrapSqlError),

        retrieve: Effect.fn("@mason/project/TaskRepo.retrieve")(function* ({
          workspaceId,
          query,
        }) {
          const maybeRow = yield* retrieveQuery({ workspaceId, ...query });

          return Option.map(maybeRow, rowToTask);
        }, wrapSqlError),

        list: Effect.fn("@mason/project/TaskRepo.list")(function* ({
          workspaceId,
          query,
        }) {
          const rows = yield* listQuery({
            workspaceId,
            ids: query.ids,
            projectId: query.projectId,
          });

          return rows.map(rowToTask);
        }, wrapSqlError),
      });
    })
  );
}
