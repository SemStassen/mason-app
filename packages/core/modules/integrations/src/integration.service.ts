import { CryptoService } from "@mason/framework/platform";
import {
  ApiKey,
  type MemberId,
  type WorkspaceId,
  WorkspaceIntegrationId,
} from "@mason/framework/types/ids";
import { generateUUID } from "@mason/framework/utils/uuid";
import { Context, Effect, Layer, Option } from "effect";
import type {
  WorkspaceIntegrationToCreate,
  WorkspaceIntegrationToUpdate,
} from "./dto";
import {
  GenericIntegrationError,
  type IntegrationError,
  WorkspaceIntegrationNotFoundError,
} from "./errors";
import { WorkspaceIntegration } from "./models/workspace-integration.model";
import { WorkspaceIntegrationRepository } from "./repositories/workspace-integration.repo";

export class IntegrationService extends Context.Tag(
  "@mason/framework/IntegrationService"
)<
  IntegrationService,
  {
    createWorkspaceIntegration: (params: {
      workspaceId: WorkspaceId;
      createdByMemberId: MemberId;
      workspaceIntegration: WorkspaceIntegrationToCreate;
    }) => Effect.Effect<WorkspaceIntegration, IntegrationError>;
    updateWorkspaceIntegration: (params: {
      workspaceId: WorkspaceId;
      workspaceIntegration: WorkspaceIntegrationToUpdate;
    }) => Effect.Effect<WorkspaceIntegration, IntegrationError>;
    hardDeleteWorkspaceIntegration: (params: {
      workspaceId: WorkspaceId;
      workspaceIntegrationId: WorkspaceIntegrationId;
    }) => Effect.Effect<void, IntegrationError>;
    retrieveWorkspaceIntegration: (params: {
      workspaceId: WorkspaceId;
      query?: {
        id?: WorkspaceIntegrationId;
        kind?: "float";
      };
    }) => Effect.Effect<WorkspaceIntegration, IntegrationError>;
    listWorkspaceIntegrations: (params: {
      workspaceId: WorkspaceId;
    }) => Effect.Effect<ReadonlyArray<WorkspaceIntegration>, IntegrationError>;
    retrieveWorkspaceApiKey: (params: {
      workspaceId: WorkspaceId;
      kind: "float";
    }) => Effect.Effect<ApiKey, IntegrationError>;
  }
>() {
  static readonly live = Layer.effect(
    IntegrationService,
    Effect.gen(function* () {
      const cryptoService = yield* CryptoService;
      const workspaceIntegrationRepo = yield* WorkspaceIntegrationRepository;

      return IntegrationService.of({
        createWorkspaceIntegration: Effect.fn(
          "@mason/framework/IntegrationService.createWorkspaceIntegration"
        )(({ workspaceId, createdByMemberId, workspaceIntegration }) =>
          Effect.gen(function* () {
            const apiKeyEncrypted = yield* cryptoService.encrypt(
              workspaceIntegration.apiKeyUnencrypted
            );

            const workspaceIntegrationToCreate = WorkspaceIntegration.make({
              ...workspaceIntegration,
              id: WorkspaceIntegrationId.make(generateUUID()),
              workspaceId: workspaceId,
              createdByMemberId: createdByMemberId,
              apiKeyEncrypted: apiKeyEncrypted,
              createdAt: new Date(),
            });

            const [createdWorkspaceIntegration] =
              yield* workspaceIntegrationRepo.insert({
                workspaceId: workspaceId,
                workspaceIntegrations: [workspaceIntegrationToCreate],
              });

            return createdWorkspaceIntegration;
          }).pipe(
            Effect.mapError((e) => new GenericIntegrationError({ cause: e }))
          )
        ),

        updateWorkspaceIntegration: Effect.fn(
          "@mason/framework/IntegrationService.updateWorkspaceIntegration"
        )(({ workspaceId, workspaceIntegration }) =>
          Effect.gen(function* () {
            const maybeExisting = yield* workspaceIntegrationRepo.retrieve({
              workspaceId,
              query: { id: workspaceIntegration.id },
            });

            const existing = yield* Option.match(maybeExisting, {
              onNone: () =>
                Effect.fail(new WorkspaceIntegrationNotFoundError()),
              onSome: Effect.succeed,
            });

            const apiKeyEncrypted = workspaceIntegration.apiKeyUnencrypted
              ? yield* cryptoService.encrypt(
                  workspaceIntegration.apiKeyUnencrypted
                )
              : existing.apiKeyEncrypted;

            const updated = WorkspaceIntegration.make({
              ...existing,
              apiKeyEncrypted,
              _metadata: workspaceIntegration._metadata ?? existing._metadata,
            });

            const [result] = yield* workspaceIntegrationRepo.update({
              workspaceId,
              workspaceIntegrations: [updated],
            });

            return result;
          }).pipe(
            Effect.catchTags({
              ParseError: (e) =>
                Effect.fail(new GenericIntegrationError({ cause: e })),
              SqlError: (e) =>
                Effect.fail(new GenericIntegrationError({ cause: e })),
            })
          )
        ),

        hardDeleteWorkspaceIntegration: Effect.fn(
          "@mason/framework/IntegrationService.hardDeleteWorkspaceIntegration"
        )(({ workspaceId, workspaceIntegrationId }) =>
          workspaceIntegrationRepo
            .hardDelete({
              workspaceId: workspaceId,
              workspaceIntegrationIds: [workspaceIntegrationId],
            })
            .pipe(
              Effect.mapError((e) => new GenericIntegrationError({ cause: e }))
            )
        ),

        retrieveWorkspaceIntegration: Effect.fn(
          "@mason/framework/IntegrationService.retrieveWorkspaceIntegration"
        )((params) =>
          Effect.gen(function* () {
            const maybeWorkspaceIntegration =
              yield* workspaceIntegrationRepo.retrieve(params);

            return yield* Option.match(maybeWorkspaceIntegration, {
              onNone: () =>
                Effect.fail(new WorkspaceIntegrationNotFoundError()),
              onSome: Effect.succeed,
            });
          }).pipe(
            Effect.catchTags({
              ParseError: (e) =>
                Effect.fail(new GenericIntegrationError({ cause: e })),
              SqlError: (e) =>
                Effect.fail(new GenericIntegrationError({ cause: e })),
            })
          )
        ),

        listWorkspaceIntegrations: Effect.fn(
          "@mason/framework/IntegrationService.listWorkspaceIntegrations"
        )(({ workspaceId }) =>
          workspaceIntegrationRepo
            .list({ workspaceId })
            .pipe(
              Effect.mapError((e) => new GenericIntegrationError({ cause: e }))
            )
        ),

        retrieveWorkspaceApiKey: Effect.fn(
          "@mason/framework/IntegrationService.retrieveWorkspaceApiKey"
        )(({ workspaceId, kind }) =>
          Effect.gen(function* () {
            const maybeWorkspaceIntegration =
              yield* workspaceIntegrationRepo.retrieve({
                workspaceId,
                query: { kind },
              });

            const workspaceIntegration = yield* Option.match(
              maybeWorkspaceIntegration,
              {
                onNone: () =>
                  Effect.fail(new WorkspaceIntegrationNotFoundError()),
                onSome: Effect.succeed,
              }
            );

            const decrypted = yield* cryptoService.decrypt(
              workspaceIntegration.apiKeyEncrypted
            );

            return ApiKey.make(decrypted);
          }).pipe(
            Effect.catchTags({
              ParseError: (e) =>
                Effect.fail(new GenericIntegrationError({ cause: e })),
              SqlError: (e) =>
                Effect.fail(new GenericIntegrationError({ cause: e })),
            })
          )
        ),
      });
    })
  );
}
