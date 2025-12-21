import {
  type MemberId,
  type WorkspaceId,
  WorkspaceIntegrationId,
} from "@mason/framework/types/ids";
import { Context, Effect, Layer, Option } from "effect";
import { decrypt, encrypt } from "../../utils/encryption";
import { generateUUID } from "../../utils/uuid";
import {
  GenericIntegrationError,
  type IntegrationError,
  WorkspaceIntegrationNotFoundError,
} from "./errors";
import type { WorkspaceIntegrationToCreate } from "./workspace-integration.dto";
import { WorkspaceIntegration } from "./workspace-integration.model";
import { WorkspaceIntegrationRepository } from "./workspace-integration.repo";

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
    hardDeleteWorkspaceIntegration: (params: {
      workspaceId: WorkspaceId;
      workspaceIntegrationId: WorkspaceIntegrationId;
    }) => Effect.Effect<void, IntegrationError>;
    retrieveWorkspaceIntegration: (params: {
      workspaceId: WorkspaceId;
      workspaceIntegrationId: WorkspaceIntegrationId;
    }) => Effect.Effect<WorkspaceIntegration, IntegrationError>;
    listWorkspaceIntegrations: (params: {
      workspaceId: WorkspaceId;
    }) => Effect.Effect<ReadonlyArray<WorkspaceIntegration>, IntegrationError>;
    retrieveWorkspaceApiKey: (params: {
      workspaceId: WorkspaceId;
      kind: "float";
    }) => Effect.Effect<string, IntegrationError>;
  }
>() {
  static readonly live = Layer.effect(
    IntegrationService,
    Effect.gen(function* () {
      const workspaceIntegrationRepo = yield* WorkspaceIntegrationRepository;

      return IntegrationService.of({
        createWorkspaceIntegration: Effect.fn(
          "@mason/framework/IntegrationService.createWorkspaceIntegration"
        )(({ workspaceId, createdByMemberId, workspaceIntegration }) =>
          Effect.gen(function* () {
            const apiKeyEncrypted = yield* encrypt(
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
        )(({ workspaceId, workspaceIntegrationId }) =>
          Effect.gen(function* () {
            const maybeWorkspaceIntegration =
              yield* workspaceIntegrationRepo.retrieve({
                workspaceId: workspaceId,
                query: {
                  id: workspaceIntegrationId,
                },
              });

            const workspaceIntegration = yield* Option.match(
              maybeWorkspaceIntegration,
              {
                onNone: () =>
                  Effect.fail(new WorkspaceIntegrationNotFoundError()),
                onSome: Effect.succeed,
              }
            );

            return workspaceIntegration;
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
            .list({
              workspaceId: workspaceId,
            })
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
                workspaceId: workspaceId,
                query: { kind: kind },
              });

            const workspaceIntegration = yield* Option.match(
              maybeWorkspaceIntegration,
              {
                onNone: () =>
                  Effect.fail(new WorkspaceIntegrationNotFoundError()),
                onSome: Effect.succeed,
              }
            );

            return yield* decrypt(workspaceIntegration.apiKeyEncrypted);
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
