import { RepositoryError, Workspace, WorkspaceRepository } from "@mason/core";
import { Drizzle, schema } from "@mason/db";
import { eq } from "drizzle-orm";
import { Effect, Layer, Option, Schema } from "effect";
import { SqlSchema } from "effect/unstable/sql";

export const WorkspaceRepositoryLayer = Layer.effect(
  WorkspaceRepository,
  Effect.gen(function* () {
    const drizzle = yield* Drizzle;

    const insertWorkspaceRow = SqlSchema.findOne({
      Request: Workspace.insert,
      Result: Workspace.select,
      execute: (request) =>
        drizzle
          .insert(schema.workspacesTable)
          .values({
            ...request,
            metadata: request.metadata as string,
          })
          .returning(),
    });

    const updateWorkspaceRow = SqlSchema.findOne({
      Request: Schema.Struct({
        id: Workspace.fields.id,
        update: Workspace.update,
      }),
      Result: Workspace.select,
      execute: ({ id, update }) =>
        drizzle
          .update(schema.workspacesTable)
          .set({
            ...update,
            metadata: update.metadata as string,
          })
          .where(eq(schema.workspacesTable.id, id))
          .returning(),
    });

    const findWorkspaceById = SqlSchema.findOne({
      Request: Workspace.fields.id,
      Result: Workspace.select,
      execute: (id) =>
        drizzle
          .select()
          .from(schema.workspacesTable)
          .where(eq(schema.workspacesTable.id, id)),
    });

    const findWorkspaceBySlug = SqlSchema.findOne({
      Request: Workspace.fields.slug,
      Result: Workspace.select,
      execute: (slug) =>
        drizzle
          .select()
          .from(schema.workspacesTable)
          .where(eq(schema.workspacesTable.slug, slug)),
    });

    return {
      insert: (data) =>
        insertWorkspaceRow(data).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      update: (data) =>
        updateWorkspaceRow(data).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findById: (id) =>
        findWorkspaceById(id).pipe(
          Effect.map(Option.some),
          Effect.catchTags({
            NoSuchElementError: () => Effect.succeed(Option.none()),
          }),
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findBySlug: (slug) =>
        findWorkspaceBySlug(slug).pipe(
          Effect.map(Option.some),
          Effect.catchTags({
            NoSuchElementError: () => Effect.succeed(Option.none()),
          }),
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
    };
  })
);
