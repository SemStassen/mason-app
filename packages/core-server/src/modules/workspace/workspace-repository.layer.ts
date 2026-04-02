import {
  Workspace,
  WorkspaceRepository,
} from "@recount/core/modules/workspace";
import { RepositoryError } from "@recount/core/shared/repository";
import { Database, schema } from "@recount/db";
import { eq, inArray } from "drizzle-orm";
import { Effect, Layer, Schema } from "effect";
import { SqlSchema } from "effect/unstable/sql";

export const WorkspaceRepositoryLayer = Layer.effect(
  WorkspaceRepository,
  Effect.gen(function* () {
    const db = yield* Database;

    const insertWorkspace = SqlSchema.findOne({
      Request: Workspace.insert,
      Result: Workspace,
      execute: (data) =>
        db.drizzle((drizzle) =>
          drizzle
            .insert(schema.workspacesTable)
            .values(data)
            .returning()
            .execute()
        ),
    });

    const updateWorkspace = SqlSchema.findOne({
      Request: Schema.Struct({
        id: Workspace.fields.id,
        update: Workspace.update,
      }),
      Result: Workspace,
      execute: ({ id, update }) =>
        db.drizzle((drizzle) =>
          drizzle
            .update(schema.workspacesTable)
            .set(update)
            .where(eq(schema.workspacesTable.id, id))
            .returning()
            .execute()
        ),
    });

    const findWorkspaceById = SqlSchema.findOneOption({
      Request: Workspace.fields.id,
      Result: Workspace,
      execute: (id) =>
        db.drizzle((drizzle) =>
          drizzle
            .select()
            .from(schema.workspacesTable)
            .where(eq(schema.workspacesTable.id, id))
            .execute()
        ),
    });

    const findWorkspaceBySlug = SqlSchema.findOneOption({
      Request: Workspace.fields.slug,
      Result: Workspace,
      execute: (slug) =>
        db.drizzle((drizzle) =>
          drizzle
            .select()
            .from(schema.workspacesTable)
            .where(eq(schema.workspacesTable.slug, slug))
            .execute()
        ),
    });

    const listWorkspacesByIds = SqlSchema.findAll({
      Request: Schema.Array(Workspace.fields.id),
      Result: Workspace,
      execute: (ids) =>
        db.drizzle((drizzle) =>
          drizzle
            .select()
            .from(schema.workspacesTable)
            .where(inArray(schema.workspacesTable.id, ids))
            .execute()
        ),
    });

    return {
      insert: (data) =>
        insertWorkspace(data).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      update: (params) =>
        updateWorkspace(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findById: (id) =>
        findWorkspaceById(id).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findBySlug: (slug) =>
        findWorkspaceBySlug(slug).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      listByIds: (ids) =>
        listWorkspacesByIds(ids).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
    };
  })
);
