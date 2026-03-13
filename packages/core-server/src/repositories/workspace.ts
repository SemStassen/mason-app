import {
  RepositoryError,
  WorkspaceId,
  WorkspaceInsert,
  WorkspaceRepository,
  WorkspaceSelect,
  WorkspaceUpdate,
} from "@mason/core";
import { Drizzle, schema } from "@mason/db";
import { Effect, Layer } from "effect";
import { SqlSchema } from "effect/unstable/sql";

export const WorkspaceRepositoryLayer = Layer.effect(
  WorkspaceRepository,
  Effect.gen(function* () {
    const drizzle = yield* Drizzle;

    const insertWorkspaceRow = SqlSchema.findOne({
      Request: WorkspaceInsert,
      Result: WorkspaceSelect,
      execute: (request) =>
        drizzle.insert(schema.workspacesTable).values(request).returning(),
    });

    const updateWorkspaceRow = SqlSchema.findOne({
      Request: WorkspaceUpdate,
      Result: WorkspaceSelect,
      execute: (request) =>
        drizzle
          .update(schema.workspacesTable)
          .set(request)
          .where(eq(schema.workspacesTable.id, request.id))
          .returning(),
    });

    const findWorkspaceById = SqlSchema.findOne({
      Request: WorkspaceId,
      Result: WorkspaceSelect,
      execute: (request) =>
        drizzle
          .select()
          .from(schema.workspacesTable)
          .where(eq(schema.workspacesTable.id, request.id))
          .returning(),
    });

    const findWorkspaceBySlug = SqlSchema.findOne({
      Request: WorkspaceSlug,
      Result: WorkspaceSelect,
      execute: (request) =>
        drizzle
          .select()
          .from(schema.workspacesTable)
          .where(eq(schema.workspacesTable.slug, request.slug))
          .returning(),
    });

    return {
      insert: insertWorkspaceRow().pipe(Effect.mapError(RepositoryError)),
      update: updateWorkspaceRow().pipe(Effect.mapError(RepositoryError)),
      findById: findWorkspaceById().pipe(Effect.mapError(RepositoryError)),
      findBySlug: findWorkspaceBySlug().pipe(Effect.mapError(RepositoryError)),
    };
  })
);
