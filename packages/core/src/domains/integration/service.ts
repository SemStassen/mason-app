import { Array, Context, Effect, Layer, Option, Redacted } from "effect";
import {
  type AuthorizationError,
  AuthorizationService,
} from "~/infra/authorization";
import { CryptoService } from "~/infra/crypto";
import {
  EncryptedApiKey,
  type MemberId,
  PlainApiKey,
  type WorkspaceId,
  type WorkspaceIntegrationId,
} from "~/shared/schemas";
import { mapNonEmptyArray } from "~/shared/utils/array";
import { IntegrationDomainError, WorkspaceIntegrationFns } from "./internal";
import { WorkspaceIntegrationRepository } from "./repositories/workspace-integration.repo";
import type {
  CreateWorkspaceIntegrationCommand,
  UpdateWorkspaceIntegrationApiKeyCommand,
} from "./schemas/commands";
import type {
  WorkspaceIntegration,
  WorkspaceIntegrationKind,
} from "./schemas/workspace-integration.model";

export class IntegrationDomainService extends Context.Tag(
  "@mason/integration/IntegrationDomainService"
)<
  IntegrationDomainService,
  {
    makeWorkspaceIntegration: (params: {
      workspaceId: WorkspaceId;
      createdByMemberId: MemberId;
      command: CreateWorkspaceIntegrationCommand;
    }) => Effect.Effect<WorkspaceIntegration, IntegrationDomainError>;
    updateWorkspaceIntegrationApiKey: (params: {
      existing: WorkspaceIntegration;
      command: UpdateWorkspaceIntegrationApiKeyCommand;
    }) => Effect.Effect<WorkspaceIntegration, IntegrationDomainError>;
    decodeWorkspaceIntegrationApiKey: (params: {
      existing: WorkspaceIntegration;
    }) => Effect.Effect<PlainApiKey, IntegrationDomainError>;
    saveWorkspaceIntegrations: (params: {
      workspaceId: WorkspaceId;
      existing: ReadonlyArray<WorkspaceIntegration>;
    }) => Effect.Effect<void, AuthorizationError | IntegrationDomainError>;
    retrieveWorkspaceIntegration: (params: {
      workspaceId: WorkspaceId;
      query?: {
        id?: WorkspaceIntegrationId;
        kind?: WorkspaceIntegrationKind;
      };
    }) => Effect.Effect<
      Option.Option<WorkspaceIntegration>,
      AuthorizationError | IntegrationDomainError
    >;
    listWorkspaceIntegrations: (params: {
      workspaceId: WorkspaceId;
    }) => Effect.Effect<
      ReadonlyArray<WorkspaceIntegration>,
      AuthorizationError | IntegrationDomainError
    >;
    hardDeleteWorkspaceIntegrations: (params: {
      workspaceId: WorkspaceId;
      existing: ReadonlyArray<WorkspaceIntegration>;
    }) => Effect.Effect<void, AuthorizationError | IntegrationDomainError>;
  }
>() {
  static readonly live = Layer.effect(
    IntegrationDomainService,
    Effect.gen(function* () {
      const authorization = yield* AuthorizationService;
      const cryptoService = yield* CryptoService;
      const workspaceIntegrationRepo = yield* WorkspaceIntegrationRepository;

      const _encryptApiKey = (
        plainApiKey: PlainApiKey
      ): Effect.Effect<EncryptedApiKey> =>
        cryptoService
          .encrypt(Redacted.value(plainApiKey))
          .pipe(
            Effect.map((encrypted) =>
              Redacted.make(EncryptedApiKey.from.make(encrypted))
            )
          );

      const _decryptApiKey = (
        encryptedApiKey: EncryptedApiKey
      ): Effect.Effect<PlainApiKey> =>
        cryptoService
          .decrypt(Redacted.value(encryptedApiKey))
          .pipe(
            Effect.map((decrypted) =>
              Redacted.make(PlainApiKey.from.make(decrypted))
            )
          );

      return IntegrationDomainService.of({
        makeWorkspaceIntegration: ({
          workspaceId,
          createdByMemberId,
          command,
        }) =>
          WorkspaceIntegrationFns.create(command, {
            workspaceId,
            createdByMemberId,
            encryptApiKey: _encryptApiKey,
          }),

        updateWorkspaceIntegrationApiKey: ({ existing, command }) =>
          WorkspaceIntegrationFns.updateApiKey(existing, {
            plainApiKey: command,
            encryptApiKey: _encryptApiKey,
          }),

        decodeWorkspaceIntegrationApiKey: ({ existing }) =>
          _decryptApiKey(existing.encryptedApiKey),

        saveWorkspaceIntegrations: Effect.fn(
          "integration/IntegrationDomainService.saveWorkspaceIntegrations"
        )(
          function* ({ workspaceId, existing }) {
            if (Array.isNonEmptyReadonlyArray(existing)) {
              yield* authorization.ensureWorkspaceMatches({
                workspaceId,
                model: existing,
              });

              yield* workspaceIntegrationRepo.upsert({
                workspaceId,
                workspaceIntegrations: existing,
              });
            }
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new IntegrationDomainError({ cause: e })),
          })
        ),

        retrieveWorkspaceIntegration: Effect.fn(
          "integration/IntegrationDomainService.retrieveWorkspaceIntegration"
        )(
          function* ({ workspaceId, query }) {
            const existing = yield* workspaceIntegrationRepo.retrieve({
              workspaceId,
              query: query ?? {},
            });

            if (Option.isSome(existing)) {
              yield* authorization.ensureWorkspaceMatches({
                workspaceId,
                model: [existing.value],
              });
            }

            return existing;
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new IntegrationDomainError({ cause: e })),
          })
        ),

        listWorkspaceIntegrations: Effect.fn(
          "integration/IntegrationDomainService.listWorkspaceIntegrations"
        )(
          function* ({ workspaceId }) {
            const existing = yield* workspaceIntegrationRepo.list({
              workspaceId,
              query: {},
            });

            yield* authorization.ensureWorkspaceMatches({
              workspaceId,
              model: existing,
            });

            return existing;
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new IntegrationDomainError({ cause: e })),
          })
        ),

        hardDeleteWorkspaceIntegrations: Effect.fn(
          "integration/IntegrationDomainService.hardDeleteWorkspaceIntegrations"
        )(
          function* ({ workspaceId, existing }) {
            if (Array.isNonEmptyReadonlyArray(existing)) {
              yield* authorization.ensureWorkspaceMatches({
                workspaceId,
                model: existing,
              });

              const workspaceIntegrationIds = mapNonEmptyArray(
                existing,
                (e) => e.id
              );

              yield* workspaceIntegrationRepo.hardDelete({
                workspaceId,
                workspaceIntegrationsIds: workspaceIntegrationIds,
              });
            }
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new IntegrationDomainError({ cause: e })),
          })
        ),
      });
    })
  );
}
