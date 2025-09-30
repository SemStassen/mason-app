import { and, eq, } from "@mason/db/operators";
import {  Effect, Schema } from "effect";
import {  WorkspaceId, WorkspaceIntegrationId } from "../models/ids";
import {
  WorkspaceIntegration,
  type WorkspaceIntegrationToUpsert,
} from "../models/workspace-integration.model";
import { decrypt, encrypt } from "../utils/encryption";
import { DatabaseService } from "./db";
import { ProjectsService } from "./projects";
import { workspaceIntegrationsTable } from "@mason/db/schema";

export class WorkspaceIntegrationNotFoundError extends Schema.TaggedError<WorkspaceIntegrationNotFoundError>()(
  "@mason/core/workspaceIntegrationNotFoundError", {}
) {}

export class WorkspaceIntegrationsService extends Effect.Service<WorkspaceIntegrationsService>()(
  "@mason/core/workspaceIntegrationsService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DatabaseService;
      const projectsService = yield* ProjectsService;

      return {
        upsertWorkspaceIntegration: ({
          workspaceId,
          workspaceIntegration,
        }: {
          workspaceId: typeof WorkspaceId.Type;
          workspaceIntegration: typeof WorkspaceIntegrationToUpsert.Type;
        }) =>
          Effect.gen(function* () {
            const apiKeyEncrypted = yield* encrypt(
              workspaceIntegration.apiKeyUnencrypted
            );

            const [upsertedWorkspaceIntegration] = yield* db.use((conn) =>
              conn
                .insert(workspaceIntegrationsTable)
                .values({
                  workspaceId: workspaceId,
                  apiKeyEncrypted: apiKeyEncrypted,
                  ...workspaceIntegration,
                })
                .onConflictDoUpdate({
                  target: [
                    workspaceIntegrationsTable.workspaceId,
                    workspaceIntegrationsTable.kind,
                  ],
                  set: {
                    apiKeyEncrypted: apiKeyEncrypted,
                  },
                })
                .returning()
            );

            return WorkspaceIntegration.make({
              ...upsertedWorkspaceIntegration,
              id: WorkspaceIntegrationId.make(upsertedWorkspaceIntegration.id),
              workspaceId: WorkspaceId.make(
                upsertedWorkspaceIntegration.workspaceId
              ),
            });
          }),
        deleteWorkspaceIntegration: ({
          workspaceId,
          id,
        }: {
          workspaceId: typeof WorkspaceId.Type;
          id: typeof WorkspaceIntegrationId.Type;
        }) =>
          Effect.gen(function* () {
            yield* db.use((conn) =>
              conn
                .delete(workspaceIntegrationsTable)
                .where(
                  and(
                    eq(workspaceIntegrationsTable.id, id),
                    eq(workspaceIntegrationsTable.workspaceId, workspaceId)
                  )
                )
            );
          }),
        listWorkspaceIntegrations: ({
          workspaceId,
        }: {
          workspaceId: typeof WorkspaceId.Type;
        }) =>
          Effect.gen(function* () {
            const workspaceIntegrations = yield* db.use((conn) =>
              conn.query.workspaceIntegrationsTable.findMany({
                where: and(
                  eq(workspaceIntegrationsTable.workspaceId, workspaceId),
                ),
              })
            );

            return workspaceIntegrations.map((integration) =>
              WorkspaceIntegration.make({
                ...integration,
                id: WorkspaceIntegrationId.make(integration.id),
                workspaceId: WorkspaceId.make(integration.workspaceId),
              })
            );
          }),
        retrieveUnencryptedApiKey: ({
          workspaceId,
          kind,
        }: {
          workspaceId: typeof WorkspaceId.Type;
          kind: typeof WorkspaceIntegration.fields.kind.Type;
        }) =>
          Effect.gen(function* () {
            const workspaceIntegration = yield* db.use((conn) =>
              conn.query.workspaceIntegrationsTable.findFirst({
                where: and(
                  eq(workspaceIntegrationsTable.workspaceId, workspaceId),
                  eq(workspaceIntegrationsTable.kind, kind)
                ),
              })
            );

            if (!workspaceIntegration) {
              return yield* Effect.fail(
                new WorkspaceIntegrationNotFoundError()
              );
            }

            const unencryptedApiKey = yield* decrypt(
              workspaceIntegration.apiKeyEncrypted
            );

            return unencryptedApiKey;
          }),
      };
    }),
  }
) {}
