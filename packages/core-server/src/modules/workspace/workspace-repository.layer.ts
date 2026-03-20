import { Workspace, WorkspaceRepository } from "@mason/core/modules/workspace";
import { RepositoryError } from "@mason/core/shared/repository";
import { schema } from "@mason/db";
import { eq } from "drizzle-orm";
import { Effect, Layer, Schema } from "effect";
import { SqlSchema } from "effect/unstable/sql";

import { Database } from "@mason/db";

export const WorkspaceRepositoryLayer = Layer.effect(
  WorkspaceRepository,
  Effect.gen(function* () {
    const { drizzle } = yield* Database;

    const insertWorkspace = SqlSchema.findOne({
      Request: Workspace.insert,
      Result: Workspace,
      execute: (data) =>
        drizzle
          .insert(schema.workspacesTable)
          .values(data)
          .returning()
          .execute(),
    });

    const updateWorkspace = SqlSchema.findOne({
      Request: Schema.Struct({
        id: Workspace.fields.id,
        update: Workspace.update,
      }),
      Result: Workspace,
      execute: ({ id, update }) =>
        drizzle
          .update(schema.workspacesTable)
          .set(update)
          .where(eq(schema.workspacesTable.id, id))
          .returning()
          .execute(),
    });

    const findWorkspaceById = SqlSchema.findOneOption({
      Request: Workspace.fields.id,
      Result: Workspace,
      execute: (id) =>
        drizzle
          .select()
          .from(schema.workspacesTable)
          .where(eq(schema.workspacesTable.id, id))
          .execute(),
    });

    const findWorkspaceBySlug = SqlSchema.findOneOption({
      Request: Workspace.fields.slug,
      Result: Workspace,
      execute: (slug) =>
        drizzle
          .select()
          .from(schema.workspacesTable)
          .where(eq(schema.workspacesTable.slug, slug))
          .execute(),
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
    };
  })
);
