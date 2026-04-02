import { WorkspaceIntegration } from "@recount/core/modules/integration";
import { RepositoryError } from "@recount/core/shared/repository";
import { Database, schema } from "@recount/db";
import { and, eq } from "drizzle-orm";
import { Effect, Layer, Redacted, Schema } from "effect";
import { SqlSchema } from "effect/unstable/sql";

import { WorkspaceIntegrationRepository } from "./workspace-integration-repository.service";

export const WorkspaceIntegrationRepositoryLayer = Layer.effect(
  WorkspaceIntegrationRepository,
  Effect.gen(function* () {
    const db = yield* Database;

    const insertWorkspaceIntegration = SqlSchema.findOne({
      Request: WorkspaceIntegration.insert,
      Result: WorkspaceIntegration,
      execute: (data) =>
        db.drizzle((drizzle) =>
          drizzle
            .insert(schema.workspaceIntegrationsTable)
            .values({
              ...data,
              encryptedApiKey: Redacted.value(data.apiKey),
            })
            .returning()
            .execute()
        ),
    });

    const updateWorkspaceIntegration = SqlSchema.findOne({
      Request: Schema.Struct({
        workspaceId: WorkspaceIntegration.fields.workspaceId,
        id: WorkspaceIntegration.fields.id,
        update: WorkspaceIntegration.update,
      }),
      Result: WorkspaceIntegration,
      execute: ({ workspaceId, id, update }) =>
        db.drizzle((drizzle) =>
          drizzle
            .update(schema.workspaceIntegrationsTable)
            .set({
              ...update,
              ...(update.apiKey
                ? { encryptedApiKey: Redacted.value(update.apiKey) }
                : {}),
            })
            .where(
              and(
                eq(schema.workspaceIntegrationsTable.workspaceId, workspaceId),
                eq(schema.workspaceIntegrationsTable.id, id)
              )
            )
            .returning()
            .execute()
        ),
    });

    const hardDeleteWorkspaceIntegration = SqlSchema.void({
      Request: Schema.Struct({
        workspaceId: WorkspaceIntegration.fields.workspaceId,
        id: WorkspaceIntegration.fields.id,
      }),
      execute: ({ workspaceId, id }) =>
        db.drizzle((drizzle) =>
          drizzle
            .delete(schema.workspaceIntegrationsTable)
            .where(
              and(
                eq(schema.workspaceIntegrationsTable.workspaceId, workspaceId),
                eq(schema.workspaceIntegrationsTable.id, id)
              )
            )
            .execute()
        ),
    });

    const findWorkspaceIntegrationById = SqlSchema.findOneOption({
      Request: Schema.Struct({
        workspaceId: WorkspaceIntegration.fields.workspaceId,
        id: WorkspaceIntegration.fields.id,
      }),
      Result: WorkspaceIntegration,
      execute: ({ workspaceId, id }) =>
        db.drizzle((drizzle) =>
          drizzle
            .select()
            .from(schema.workspaceIntegrationsTable)
            .where(
              and(
                eq(schema.workspaceIntegrationsTable.workspaceId, workspaceId),
                eq(schema.workspaceIntegrationsTable.id, id)
              )
            )
            .execute()
        ),
    });

    const findWorkspaceIntegrationByProvider = SqlSchema.findOneOption({
      Request: Schema.Struct({
        workspaceId: WorkspaceIntegration.fields.workspaceId,
        provider: WorkspaceIntegration.fields.provider,
      }),
      Result: WorkspaceIntegration,
      execute: ({ workspaceId, provider }) =>
        db.drizzle((drizzle) =>
          drizzle
            .select()
            .from(schema.workspaceIntegrationsTable)
            .where(
              and(
                eq(schema.workspaceIntegrationsTable.workspaceId, workspaceId),
                eq(schema.workspaceIntegrationsTable.provider, provider)
              )
            )
            .execute()
        ),
    });

    return {
      insert: (data) =>
        insertWorkspaceIntegration(data).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      update: (params) =>
        updateWorkspaceIntegration(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      hardDelete: (params) =>
        hardDeleteWorkspaceIntegration(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findById: (params) =>
        findWorkspaceIntegrationById(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findByProvider: (params) =>
        findWorkspaceIntegrationByProvider(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
    };
  })
);
