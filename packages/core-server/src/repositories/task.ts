import { RepositoryError, Task, TaskRepository } from "@mason/core";
import { Drizzle, schema } from "@mason/db";
import { and, eq, inArray } from "drizzle-orm";
import { DateTime, Effect, Layer, Schema } from "effect";
import { SqlSchema } from "effect/unstable/sql";

export const TaskRepositoryLayer = Layer.effect(
  TaskRepository,
  Effect.gen(function* () {
    const drizzle = yield* Drizzle;

    const insertManyTasks = SqlSchema.findAll({
      Request: Schema.Array(Task.insert),
      Result: Task,
      execute: (data) =>
        drizzle
          .insert(schema.tasksTable)
          .values([...data])
          .returning(),
    });

    const updateTask = SqlSchema.findOne({
      Request: Schema.Struct({
        workspaceId: Task.fields.workspaceId,
        id: Task.fields.id,
        update: Task.update,
      }),
      Result: Task,
      execute: ({ workspaceId, id, update }) =>
        drizzle
          .update(schema.tasksTable)
          .set(update)
          .where(
            and(
              eq(schema.tasksTable.workspaceId, workspaceId),
              eq(schema.tasksTable.id, id)
            )
          )
          .returning(),
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

          return yield* drizzle
            .update(schema.tasksTable)
            .set({ archivedAt: DateTime.toDate(now) })
            .where(
              and(
                eq(schema.tasksTable.workspaceId, workspaceId),
                inArray(schema.tasksTable.id, ids)
              )
            )
            .returning();
        }),
    });

    const restoreManyTasks = SqlSchema.findAll({
      Request: Schema.Struct({
        workspaceId: Task.fields.workspaceId,
        ids: Schema.Array(Task.fields.id),
      }),
      Result: Task,
      execute: ({ workspaceId, ids }) =>
        drizzle
          .update(schema.tasksTable)
          .set({ archivedAt: null })
          .where(
            and(
              eq(schema.tasksTable.workspaceId, workspaceId),
              inArray(schema.tasksTable.id, ids)
            )
          )
          .returning(),
    });

    const findTaskById = SqlSchema.findOneOption({
      Request: Schema.Struct({
        workspaceId: Task.fields.workspaceId,
        id: Task.fields.id,
      }),
      Result: Task,
      execute: ({ workspaceId, id }) =>
        drizzle
          .select()
          .from(schema.tasksTable)
          .where(
            and(
              eq(schema.tasksTable.workspaceId, workspaceId),
              eq(schema.tasksTable.id, id)
            )
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
