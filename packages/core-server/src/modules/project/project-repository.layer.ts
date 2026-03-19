import { Project, ProjectRepository } from "@mason/core/modules/project";
import { RepositoryError } from "@mason/core/shared/repository";
import { schema } from "@mason/db";
import { and, eq, inArray } from "drizzle-orm";
import { DateTime, Effect, Layer, Schema } from "effect";
import { SqlSchema } from "effect/unstable/sql";

import { Database } from "#shared/database/index";

export const ProjectRepositoryLayer = Layer.effect(
  ProjectRepository,
  Effect.gen(function* () {
    const { drizzle } = yield* Database;

    const insertManyProjects = SqlSchema.findAll({
      Request: Schema.Array(Project.insert),
      Result: Project,
      execute: (data) =>
        drizzle
          .insert(schema.projectsTable)
          .values([...data])
          .returning()
          .execute(),
    });

    const updateProject = SqlSchema.findOne({
      Request: Schema.Struct({
        workspaceId: Project.fields.workspaceId,
        id: Project.fields.id,
        update: Project.update,
      }),
      Result: Project,
      execute: ({ workspaceId, id, update }) =>
        drizzle
          .update(schema.projectsTable)
          .set(update)
          .where(
            and(
              eq(schema.projectsTable.workspaceId, workspaceId),
              eq(schema.projectsTable.id, id)
            )
          )
          .returning()
          .execute(),
    });

    const archiveManyProjects = SqlSchema.findAll({
      Request: Schema.Struct({
        workspaceId: Project.fields.workspaceId,
        ids: Schema.Array(Project.fields.id),
      }),
      Result: Project,
      execute: ({ workspaceId, ids }) =>
        Effect.gen(function* () {
          const now = yield* DateTime.now;

          return yield* drizzle
            .update(schema.projectsTable)
            .set({ archivedAt: DateTime.toDate(now) })
            .where(
              and(
                eq(schema.projectsTable.workspaceId, workspaceId),
                inArray(schema.projectsTable.id, ids)
              )
            )
            .returning()
            .execute();
        }),
    });

    const restoreManyProjects = SqlSchema.findAll({
      Request: Schema.Struct({
        workspaceId: Project.fields.workspaceId,
        ids: Schema.Array(Project.fields.id),
      }),
      Result: Project,
      execute: ({ workspaceId, ids }) =>
        drizzle
          .update(schema.projectsTable)
          .set({ archivedAt: null })
          .where(
            and(
              eq(schema.projectsTable.workspaceId, workspaceId),
              inArray(schema.projectsTable.id, ids)
            )
          )
          .returning()
          .execute(),
    });

    const findProjectById = SqlSchema.findOneOption({
      Request: Schema.Struct({
        workspaceId: Project.fields.workspaceId,
        id: Project.fields.id,
      }),
      Result: Project,
      execute: ({ workspaceId, id }) =>
        drizzle
          .select()
          .from(schema.projectsTable)
          .where(
            and(
              eq(schema.projectsTable.workspaceId, workspaceId),
              eq(schema.projectsTable.id, id)
            )
          )
          .execute(),
    });

    const findManyByIds = SqlSchema.findAll({
      Request: Schema.Struct({
        workspaceId: Project.fields.workspaceId,
        ids: Schema.Array(Project.fields.id),
      }),
      Result: Project,
      execute: ({ workspaceId, ids }) =>
        drizzle
          .select()
          .from(schema.projectsTable)
          .where(
            and(
              eq(schema.projectsTable.workspaceId, workspaceId),
              inArray(schema.projectsTable.id, ids)
            )
          )
          .execute(),
    });

    return {
      insertMany: (data) =>
        insertManyProjects(data).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      update: (params) =>
        updateProject(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      archiveMany: (params) =>
        archiveManyProjects(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      restoreMany: (params) =>
        restoreManyProjects(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findById: (params) =>
        findProjectById(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findManyByIds: (params) =>
        findManyByIds(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
    };
  })
);
