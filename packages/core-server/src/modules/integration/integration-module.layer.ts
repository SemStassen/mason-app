import {
  WorkspaceIntegrationNotFoundError,
  WorkspaceIntegrationProviderAlreadyExistsError,
} from "@recount/core/modules/integration";
import { EncryptedApiKey, PlainApiKey } from "@recount/core/shared/schemas";
import { DateTime, Effect, Layer, Option, Redacted } from "effect";

import { Crypto } from "#shared/crypto/index";

import * as workspaceIntegrationTransitions from "./domain/workspace-integration.transitions";
import { IntegrationModule } from "./integration-module.service";
import { WorkspaceIntegrationRepository } from "./workspace-integration-repository.service";

export const IntegrationModuleLayer = Layer.effect(
  IntegrationModule,
  Effect.gen(function* () {
    const crypto = yield* Crypto;
    const workspaceIntegrationRepo = yield* WorkspaceIntegrationRepository;

    const encryptApiKey = Effect.fn("integration.encryptApiKey")(function* (
      apiKey: Redacted.Redacted<string>
    ) {
      const encrypted = yield* crypto.encrypt(Redacted.value(apiKey));

      return EncryptedApiKey.makeUnsafe(Redacted.make(encrypted));
    });

    const decryptApiKey = Effect.fn("integration.decryptApiKey")(function* (
      encryptedApiKey: EncryptedApiKey
    ) {
      const decrypted = yield* crypto.decrypt(Redacted.value(encryptedApiKey));

      return PlainApiKey.makeUnsafe(Redacted.make(decrypted));
    });

    return {
      createWorkspaceIntegration: Effect.fn(
        "integration.createWorkspaceIntegration"
      )(function* (params) {
        const now = yield* DateTime.now;

        yield* workspaceIntegrationRepo
          .findByProvider({
            workspaceId: params.workspaceId,
            provider: params.data.provider,
          })
          .pipe(
            Effect.flatMap(
              Option.match({
                onSome: () =>
                  Effect.fail(
                    new WorkspaceIntegrationProviderAlreadyExistsError()
                  ),
                onNone: () => Effect.void,
              })
            )
          );

        const encryptedApiKey = yield* encryptApiKey(params.data.apiKey);

        const workspaceIntegration = yield* Effect.fromResult(
          workspaceIntegrationTransitions.createWorkspaceIntegration({
            createdByWorkspaceMemberId: params.createdByWorkspaceMemberId,
            workspaceId: params.workspaceId,
            data: params.data,
            apiKey: encryptedApiKey,
            now,
          })
        );

        const persistedWorkspaceIntegration =
          yield* workspaceIntegrationRepo.insert(workspaceIntegration);

        return persistedWorkspaceIntegration;
      }),
      updateWorkspaceIntegration: Effect.fn(
        "integration.updateWorkspaceIntegration"
      )(function* (params) {
        const workspaceIntegration = yield* workspaceIntegrationRepo
          .findById({
            workspaceId: params.workspaceId,
            id: params.id,
          })
          .pipe(
            Effect.flatMap(
              Option.match({
                onNone: () =>
                  Effect.fail(
                    new WorkspaceIntegrationNotFoundError({
                      workspaceIntegrationId: params.id,
                    })
                  ),
                onSome: Effect.succeed,
              })
            )
          );

        const encryptedApiKey = params.data.apiKey
          ? yield* encryptApiKey(params.data.apiKey)
          : undefined;

        const { entity, changes } = yield* Effect.fromResult(
          workspaceIntegrationTransitions.updateWorkspaceIntegration({
            workspaceIntegration,
            data: params.data,
            apiKey: encryptedApiKey,
          })
        );

        const persistedWorkspaceIntegration =
          yield* workspaceIntegrationRepo.update({
            workspaceId: params.workspaceId,
            id: entity.id,
            update: changes,
          });

        return persistedWorkspaceIntegration;
      }),
      hardDeleteWorkspaceIntegration: Effect.fn(
        "integration.hardDeleteWorkspaceIntegration"
      )(function* (params) {
        const workspaceIntegration = yield* workspaceIntegrationRepo
          .findById({
            workspaceId: params.workspaceId,
            id: params.id,
          })
          .pipe(
            Effect.flatMap(
              Option.match({
                onNone: () =>
                  Effect.fail(
                    new WorkspaceIntegrationNotFoundError({
                      workspaceIntegrationId: params.id,
                    })
                  ),
                onSome: Effect.succeed,
              })
            )
          );

        yield* workspaceIntegrationRepo.hardDelete({
          workspaceId: params.workspaceId,
          id: workspaceIntegration.id,
        });
      }),
      revealWorkspaceIntegrationApiKey: Effect.fn(
        "integration.revealWorkspaceIntegrationApiKey"
      )(function* (params) {
        const workspaceIntegration = yield* workspaceIntegrationRepo
          .findById({
            workspaceId: params.workspaceId,
            id: params.id,
          })
          .pipe(
            Effect.flatMap(
              Option.match({
                onNone: () =>
                  Effect.fail(
                    new WorkspaceIntegrationNotFoundError({
                      workspaceIntegrationId: params.id,
                    })
                  ),
                onSome: Effect.succeed,
              })
            )
          );

        return yield* decryptApiKey(workspaceIntegration.apiKey);
      }),
    };
  })
);
