import { Task, TaskRepository } from "@recount/core/modules/project";
import { RepositoryError } from "@recount/core/shared/repository";
import { Database, schema } from "@recount/db";
import { and, eq, inArray } from "drizzle-orm";
import { DateTime, Effect, Layer, Schema } from "effect";
import { SqlSchema } from "effect/unstable/sql";

export const TaskRepositoryLayer = Layer.effect(
  TaskRepository,
  Effect.gen(function* () {
    const db = yield* Database;

    const insertManyTasks = SqlSchema.findAll({
      Request: Schema.Array(Task.insert),
      Result: Task,
      execute: (data) =>
        db.drizzle((drizzle) =>
          drizzle
            .insert(schema.tasksTable)
            .values([...data])
            .returning()
            .execute()
        ),
    });

    const updateTask = SqlSchema.findOne({
      Request: Schema.Struct({
        workspaceId: Task.fields.workspaceId,
        id: Task.fields.id,
        update: Task.update,
      }),
      Result: Task,
      execute: ({ workspaceId, id, update }) =>
        db.drizzle((drizzle) =>
          drizzle
            .update(schema.tasksTable)
            .set(update)
            .where(
              and(
                eq(schema.tasksTable.workspaceId, workspaceId),
                eq(schema.tasksTable.id, id)
              )
            )
            .returning()
            .execute()
        ),
    });

    const archiveManyTasks = SqlSchema.findAll({
      Request: Schema.Struct({
        workspaceId: Task.fields.workspaceId,
        ids: Schema.Array(Task.fields.id),
      }),
      Result: Task,
      execute: ({ workspaceId, ids }) =>
        Effect.gen(function* () {
          const now = yield* DateTime.now;

          return yield* db.drizzle((drizzle) =>
            drizzle
              .update(schema.tasksTable)
              .set({ archivedAt: DateTime.toDate(now) })
              .where(
                and(
                  eq(schema.tasksTable.workspaceId, workspaceId),
                  inArray(schema.tasksTable.id, ids)
                )
              )
              .returning()
              .execute()
          );
        }),
    });

    const restoreManyTasks = SqlSchema.findAll({
      Request: Schema.Struct({
        workspaceId: Task.fields.workspaceId,
        ids: Schema.Array(Task.fields.id),
      }),
      Result: Task,
      execute: ({ workspaceId, ids }) =>
        db.drizzle((drizzle) =>
          drizzle
            .update(schema.tasksTable)
            .set({ archivedAt: null })
            .where(
              and(
                eq(schema.tasksTable.workspaceId, workspaceId),
                inArray(schema.tasksTable.id, ids)
              )
            )
            .returning()
            .execute()
        ),
    });

    const findTaskById = SqlSchema.findOneOption({
      Request: Schema.Struct({
        workspaceId: Task.fields.workspaceId,
        id: Task.fields.id,
      }),
      Result: Task,
      execute: ({ workspaceId, id }) =>
        db.drizzle((drizzle) =>
          drizzle
            .select()
            .from(schema.tasksTable)
            .where(
              and(
                eq(schema.tasksTable.workspaceId, workspaceId),
                eq(schema.tasksTable.id, id)
              )
            )
            .execute()
        ),
    });

    return {
      insertMany: (data) =>
        insertManyTasks(data).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      update: (params) =>
        updateTask(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      archiveMany: (params) =>
        archiveManyTasks(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      restoreMany: (params) =>
        restoreManyTasks(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findById: (params) =>
        findTaskById(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
    };
  })
);
