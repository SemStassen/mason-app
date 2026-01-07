import { Context, Effect, Layer, Option, Redacted } from "effect";
import type { ParseError } from "effect/ParseResult";
import { AuthorizationService } from "~/application/authorization";
import { CryptoService } from "~/infra/crypto";
import type { AuthorizationError } from "~/shared/errors/authorization";
import {
  EncryptedApiKey,
  type MemberId,
  PlainApiKey,
  type WorkspaceId,
  type WorkspaceIntegrationId,
} from "~/shared/schemas";
import {
  IntegrationDomainError,
  WorkspaceIntegrationFns,
  WorkspaceIntegrationNotFoundError,
} from "./internal";
import { WorkspaceIntegrationRepository } from "./repositories/workspace-integration.repo";
import type {
  CreateWorkspaceIntegrationCommand,
  UpdateWorkspaceIntegrationCommand,
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
    createWorkspaceIntegration: (params: {
      workspaceId: WorkspaceId;
      createdByMemberId: MemberId;
      workspaceIntegration: CreateWorkspaceIntegrationCommand;
    }) => Effect.Effect<WorkspaceIntegration, IntegrationDomainError>;
    updateWorkspaceIntegration: (params: {
      workspaceId: WorkspaceId;
      workspaceIntegration: UpdateWorkspaceIntegrationCommand;
    }) => Effect.Effect<
      WorkspaceIntegration,
      | AuthorizationError
      | IntegrationDomainError
      | WorkspaceIntegrationNotFoundError
    >;
    hardDeleteWorkspaceIntegration: (params: {
      workspaceId: WorkspaceId;
      workspaceIntegrationId: WorkspaceIntegrationId;
    }) => Effect.Effect<
      void,
      | AuthorizationError
      | IntegrationDomainError
      | WorkspaceIntegrationNotFoundError
    >;
    retrieveWorkspaceIntegration: (params: {
      workspaceId: WorkspaceId;
      query?: {
        id?: WorkspaceIntegrationId;
        kind?: WorkspaceIntegrationKind;
      };
    }) => Effect.Effect<
      WorkspaceIntegration,
      | AuthorizationError
      | IntegrationDomainError
      | WorkspaceIntegrationNotFoundError
    >;
    listWorkspaceIntegrations: (params: {
      workspaceId: WorkspaceId;
    }) => Effect.Effect<
      ReadonlyArray<WorkspaceIntegration>,
      AuthorizationError | IntegrationDomainError
    >;
    retrieveWorkspaceApiKey: (params: {
      workspaceId: WorkspaceId;
      kind: WorkspaceIntegrationKind;
    }) => Effect.Effect<
      PlainApiKey,
      | AuthorizationError
      | IntegrationDomainError
      | WorkspaceIntegrationNotFoundError
    >;
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
        createWorkspaceIntegration: Effect.fn(
          "integration/IntegrationDomainService.createWorkspaceIntegration"
        )(
          function* ({ workspaceId, createdByMemberId, workspaceIntegration }) {
            const created = yield* Effect.gen(function* () {
              const encryptedApiKey = yield* _encryptApiKey(
                workspaceIntegration.plainApiKey
              );

              return yield* WorkspaceIntegrationFns.create(
                { kind: workspaceIntegration.kind, encryptedApiKey },
                { workspaceId, createdByMemberId }
              );
            });

            const [inserted] = yield* workspaceIntegrationRepo.insert({
              workspaceId,
              workspaceIntegrations: [created],
            });

            return inserted;
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new IntegrationDomainError({ cause: e })),
            ParseError: (e: ParseError) =>
              Effect.fail(new IntegrationDomainError({ cause: e })),
          })
        ),

        updateWorkspaceIntegration: Effect.fn(
          "integration/IntegrationDomainService.updateWorkspaceIntegration"
        )(
          function* ({ workspaceId, workspaceIntegration }) {
            const existing = yield* workspaceIntegrationRepo
              .retrieve({
                workspaceId,
                query: { id: workspaceIntegration.id },
              })
              .pipe(
                Effect.flatMap(
                  Option.match({
                    onNone: () =>
                      Effect.fail(new WorkspaceIntegrationNotFoundError()),
                    onSome: Effect.succeed,
                  })
                )
              );

            yield* authorization.ensureWorkspaceMatches({
              workspaceId,
              model: [existing],
            });

            const updated = yield* Effect.gen(function* () {
              const encryptedApiKey = workspaceIntegration.plainApiKey
                ? yield* _encryptApiKey(workspaceIntegration.plainApiKey)
                : existing.encryptedApiKey;

              return yield* WorkspaceIntegrationFns.update(existing, {
                encryptedApiKey,
                ...workspaceIntegration,
              });
            });

            const [result] = yield* workspaceIntegrationRepo.update({
              workspaceId,
              workspaceIntegrations: [updated],
            });

            return result;
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new IntegrationDomainError({ cause: e })),
            ParseError: (e: ParseError) =>
              Effect.fail(new IntegrationDomainError({ cause: e })),
          })
        ),

        hardDeleteWorkspaceIntegration: Effect.fn(
          "integration/IntegrationDomainService.hardDeleteWorkspaceIntegration"
        )(
          function* ({ workspaceId, workspaceIntegrationId }) {
            const existing = yield* workspaceIntegrationRepo
              .retrieve({
                workspaceId,
                query: { id: workspaceIntegrationId },
              })
              .pipe(
                Effect.flatMap(
                  Option.match({
                    onNone: () =>
                      Effect.fail(new WorkspaceIntegrationNotFoundError()),
                    onSome: Effect.succeed,
                  })
                )
              );

            yield* authorization.ensureWorkspaceMatches({
              workspaceId,
              model: [existing],
            });

            yield* workspaceIntegrationRepo.hardDelete({
              workspaceId,
              workspaceIntegrationsIds: [existing.id],
            });
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
            const existing = yield* workspaceIntegrationRepo
              .retrieve({
                workspaceId,
                query: query ?? {},
              })
              .pipe(
                Effect.flatMap(
                  Option.match({
                    onNone: () =>
                      Effect.fail(new WorkspaceIntegrationNotFoundError()),
                    onSome: Effect.succeed,
                  })
                )
              );

            yield* authorization.ensureWorkspaceMatches({
              workspaceId,
              model: [existing],
            });

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

        retrieveWorkspaceApiKey: Effect.fn(
          "integration/IntegrationDomainService.retrieveWorkspaceApiKey"
        )(
          function* ({ workspaceId, kind }) {
            const existing = yield* workspaceIntegrationRepo
              .retrieve({
                workspaceId,
                query: { kind },
              })
              .pipe(
                Effect.flatMap(
                  Option.match({
                    onNone: () =>
                      Effect.fail(new WorkspaceIntegrationNotFoundError()),
                    onSome: Effect.succeed,
                  })
                )
              );

            yield* authorization.ensureWorkspaceMatches({
              workspaceId,
              model: [existing],
            });

            const decryptedApiKey = yield* _decryptApiKey(
              existing.encryptedApiKey
            );

            return decryptedApiKey;
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
