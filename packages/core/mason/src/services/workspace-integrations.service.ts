import { and, eq } from "@mason/db/operators";
import { workspaceIntegrationsTable } from "@mason/db/schema";
import { Effect, Option, Schema } from "effect";
import { MemberId, WorkspaceId, WorkspaceIntegrationId } from "../models/ids";
import {
  WorkspaceIntegration,
  type WorkspaceIntegrationToCreate,
  type WorkspaceIntegrationToUpdate,
} from "../models/workspace-integration.model";
import { decrypt, encrypt } from "../utils/encryption";
import { DatabaseService } from "./db.service";

export class WorkspaceIntegrationNotFoundError extends Schema.TaggedError<WorkspaceIntegrationNotFoundError>()(
  "@mason/mason/workspaceIntegrationNotFoundError",
  {},
) {}

export class WorkspaceIntegrationsService extends Effect.Service<WorkspaceIntegrationsService>()(
  "@mason/mason/workspaceIntegrationsService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DatabaseService;

      const createWorkspaceIntegration = ({
        workspaceId,
        createdByMemberId,
        workspaceIntegration,
      }: {
        workspaceId: typeof WorkspaceId.Type;
        createdByMemberId: typeof MemberId.Type;
        workspaceIntegration: typeof WorkspaceIntegrationToCreate.Type;
      }) =>
        Effect.gen(function* () {
          const apiKeyEncrypted = yield* encrypt(
            workspaceIntegration.apiKeyUnencrypted,
          );

          const workspaceIntegrationToCreate = WorkspaceIntegration.make({
            ...workspaceIntegration,
            workspaceId: workspaceId,
            createdByMemberId: createdByMemberId,
            apiKeyEncrypted: apiKeyEncrypted,
            createdAt: new Date(),
          });

          const [createdWorkspaceIntegration] = yield* db.use(
            workspaceId,
            (conn) =>
              conn
                .insert(workspaceIntegrationsTable)
                .values(workspaceIntegrationToCreate)
                .returning(),
          );

          return Schema.decodeUnknownSync(WorkspaceIntegration)({
            ...createdWorkspaceIntegration,
            id: WorkspaceIntegrationId.make(createdWorkspaceIntegration.id),
            workspaceId: WorkspaceId.make(
              createdWorkspaceIntegration.workspaceId,
            ),
            createdByMemberId: MemberId.make(
              createdWorkspaceIntegration.createdByMemberId,
            ),
          });
        });

      const updateWorkspaceIntegration = ({
        workspaceId,
        workspaceIntegration,
      }: {
        workspaceId: typeof WorkspaceId.Type;
        workspaceIntegration: typeof WorkspaceIntegrationToUpdate.Type;
      }) =>
        Effect.gen(function* () {
          const existingWorkspaceIntegration = yield* db.use(
            workspaceId,
            (conn) =>
              conn.query.workspaceIntegrationsTable.findFirst({
                where: eq(
                  workspaceIntegrationsTable.id,
                  workspaceIntegration.id,
                ),
              }),
          );

          if (!existingWorkspaceIntegration) {
            return yield* Effect.fail(new WorkspaceIntegrationNotFoundError());
          }

          const apiKeyEncrypted = workspaceIntegration.apiKeyUnencrypted
            ? yield* encrypt(workspaceIntegration.apiKeyUnencrypted)
            : undefined;

          const workspaceIntegrationToUpdate = WorkspaceIntegration.make({
            ...existingWorkspaceIntegration,
            ...workspaceIntegration,
            ...(apiKeyEncrypted && { apiKeyEncrypted }),
            _metadata: {
              ...existingWorkspaceIntegration._metadata,
              ...workspaceIntegration._metadata,
            },
            workspaceId: workspaceId,
            createdByMemberId: MemberId.make(
              existingWorkspaceIntegration.createdByMemberId,
            ),
          });

          const [updatedWorkspaceIntegration] = yield* db.use(
            workspaceId,
            (conn) =>
              conn
                .update(workspaceIntegrationsTable)
                .set(workspaceIntegrationToUpdate)
                .where(
                  and(
                    eq(workspaceIntegrationsTable.workspaceId, workspaceId),
                    eq(workspaceIntegrationsTable.id, workspaceIntegration.id),
                  ),
                )
                .returning(),
          );

          return Schema.decodeUnknownSync(WorkspaceIntegration)({
            ...updatedWorkspaceIntegration,
            id: WorkspaceIntegrationId.make(updatedWorkspaceIntegration.id),
            workspaceId: WorkspaceId.make(
              updatedWorkspaceIntegration.workspaceId,
            ),
            createdByMemberId: MemberId.make(
              updatedWorkspaceIntegration.createdByMemberId,
            ),
          });
        });

      return {
        createWorkspaceIntegration: createWorkspaceIntegration,
        updateWorkspaceIntegration: updateWorkspaceIntegration,
        hardDeleteWorkspaceIntegration: ({
          workspaceId,
          id,
        }: {
          workspaceId: typeof WorkspaceId.Type;
          id: typeof WorkspaceIntegrationId.Type;
        }) =>
          db.use(workspaceId, (conn) =>
            conn
              .delete(workspaceIntegrationsTable)
              .where(
                and(
                  eq(workspaceIntegrationsTable.id, id),
                  eq(workspaceIntegrationsTable.workspaceId, workspaceId),
                ),
              ),
          ),
        retrieveWorkspaceIntegration: ({
          workspaceId,
          kind,
        }: {
          workspaceId: typeof WorkspaceId.Type;
          kind: typeof WorkspaceIntegration.fields.kind.Type;
        }) =>
          Effect.gen(function* () {
            const workspaceIntegration = yield* db.use(workspaceId, (conn) =>
              conn.query.workspaceIntegrationsTable.findFirst({
                where: and(
                  eq(workspaceIntegrationsTable.workspaceId, workspaceId),
                  eq(workspaceIntegrationsTable.kind, kind),
                ),
              }),
            );

            return Option.fromNullable(workspaceIntegration).pipe(
              Option.map((integration) =>
                Schema.decodeUnknownSync(WorkspaceIntegration)({
                  ...integration,
                  id: WorkspaceIntegrationId.make(integration.id),
                  workspaceId: WorkspaceId.make(integration.workspaceId),
                  createdByMemberId: MemberId.make(
                    integration.createdByMemberId,
                  ),
                }),
              ),
            );
          }),
        listWorkspaceIntegrations: ({
          workspaceId,
        }: {
          workspaceId: typeof WorkspaceId.Type;
        }) =>
          Effect.gen(function* () {
            const workspaceIntegrations = yield* db.use(workspaceId, (conn) =>
              conn.query.workspaceIntegrationsTable.findMany({
                where: and(
                  eq(workspaceIntegrationsTable.workspaceId, workspaceId),
                ),
              }),
            );

            return workspaceIntegrations.map((integration) =>
              Schema.decodeUnknownSync(WorkspaceIntegration)({
                ...integration,
                id: WorkspaceIntegrationId.make(integration.id),
                workspaceId: WorkspaceId.make(integration.workspaceId),
                createdByMemberId: MemberId.make(integration.createdByMemberId),
              }),
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
            const workspaceIntegration = yield* db.use(workspaceId, (conn) =>
              conn.query.workspaceIntegrationsTable.findFirst({
                where: and(
                  eq(workspaceIntegrationsTable.workspaceId, workspaceId),
                  eq(workspaceIntegrationsTable.kind, kind),
                ),
              }),
            );

            if (!workspaceIntegration) {
              return yield* Effect.fail(
                new WorkspaceIntegrationNotFoundError(),
              );
            }

            const unencryptedApiKey = yield* decrypt(
              workspaceIntegration.apiKeyEncrypted,
            );

            return unencryptedApiKey;
          }),
      };
    }),
  },
) {}
