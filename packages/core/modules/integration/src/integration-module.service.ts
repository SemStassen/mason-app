import {
  CryptoService,
  EncryptedApiKey,
  type ExistingMemberId,
  type ExistingWorkspaceId,
  PlainApiKey,
  type WorkspaceIntegrationId,
} from "@mason/framework";
import { Context, Effect, Layer, Option, Redacted } from "effect";
import type { ParseError } from "effect/ParseResult";
import { WorkspaceIntegration } from "./domain";
import type {
  WorkspaceIntegrationToCreateDTO,
  WorkspaceIntegrationToUpdateDTO,
} from "./dto";
import {
  InternalIntegrationModuleError,
  WorkspaceIntegrationNotFoundError,
} from "./errors";
import { WorkspaceIntegrationRepository } from "./infra/workspace-integration.repo";

export class IntegrationModuleService extends Context.Tag(
  "@mason/integration/IntegrationModuleService"
)<
  IntegrationModuleService,
  {
    createWorkspaceIntegration: (params: {
      workspaceId: ExistingWorkspaceId;
      createdByMemberId: ExistingMemberId;
      workspaceIntegration: WorkspaceIntegrationToCreateDTO;
    }) => Effect.Effect<
      WorkspaceIntegration.WorkspaceIntegration,
      InternalIntegrationModuleError
    >;
    updateWorkspaceIntegration: (params: {
      workspaceId: ExistingWorkspaceId;
      workspaceIntegration: WorkspaceIntegrationToUpdateDTO;
    }) => Effect.Effect<
      WorkspaceIntegration.WorkspaceIntegration,
      InternalIntegrationModuleError | WorkspaceIntegrationNotFoundError
    >;
    hardDeleteWorkspaceIntegration: (params: {
      workspaceId: ExistingWorkspaceId;
      workspaceIntegrationId: WorkspaceIntegrationId;
    }) => Effect.Effect<void, InternalIntegrationModuleError>;
    retrieveWorkspaceIntegration: (params: {
      workspaceId: ExistingWorkspaceId;
      query?: {
        id?: WorkspaceIntegrationId;
        kind?: "float";
      };
    }) => Effect.Effect<
      WorkspaceIntegration.WorkspaceIntegration,
      InternalIntegrationModuleError | WorkspaceIntegrationNotFoundError
    >;
    listWorkspaceIntegrations: (params: {
      workspaceId: ExistingWorkspaceId;
      query?: {
        ids?: ReadonlyArray<WorkspaceIntegrationId>;
      };
    }) => Effect.Effect<
      ReadonlyArray<WorkspaceIntegration.WorkspaceIntegration>,
      InternalIntegrationModuleError
    >;
    retrieveWorkspaceApiKey: (params: {
      workspaceId: ExistingWorkspaceId;
      kind: "float";
    }) => Effect.Effect<
      PlainApiKey,
      InternalIntegrationModuleError | WorkspaceIntegrationNotFoundError
    >;
  }
>() {
  static readonly live = Layer.effect(
    IntegrationModuleService,
    Effect.gen(function* () {
      const workspaceIntegrationRepo = yield* WorkspaceIntegrationRepository;
      const cryptoService = yield* CryptoService;

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

      return IntegrationModuleService.of({
        createWorkspaceIntegration: Effect.fn(
          "@mason/integration/IntegrationModuleService.createWorkspaceIntegration"
        )(
          function* ({ workspaceId, createdByMemberId, workspaceIntegration }) {
            const encryptedApiKey = yield* _encryptApiKey(
              workspaceIntegration.plainApiKey
            );

            const integration = yield* WorkspaceIntegration.create(
              { kind: workspaceIntegration.kind, encryptedApiKey },
              { workspaceId, createdByMemberId }
            );

            const [inserted] = yield* workspaceIntegrationRepo.insert([
              integration,
            ]);

            return inserted;
          },
          Effect.catchTags({
            "@mason/framework/DatabaseError": (e) =>
              Effect.fail(new InternalIntegrationModuleError({ cause: e })),
            ParseError: (e: ParseError) =>
              Effect.fail(new InternalIntegrationModuleError({ cause: e })),
          })
        ),

        updateWorkspaceIntegration: Effect.fn(
          "@mason/integration/IntegrationModuleService.updateWorkspaceIntegration"
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

            const encryptedApiKey = workspaceIntegration.plainApiKey
              ? yield* _encryptApiKey(workspaceIntegration.plainApiKey)
              : existing.encryptedApiKey;

            const updated = yield* WorkspaceIntegration.update(existing, {
              encryptedApiKey,
              ...(workspaceIntegration._metadata && {
                _metadata: workspaceIntegration._metadata,
              }),
            });

            const [result] = yield* workspaceIntegrationRepo.update([updated]);

            return result;
          },
          Effect.catchTags({
            "@mason/framework/DatabaseError": (e) =>
              Effect.fail(new InternalIntegrationModuleError({ cause: e })),
            ParseError: (e: ParseError) =>
              Effect.fail(new InternalIntegrationModuleError({ cause: e })),
          })
        ),

        hardDeleteWorkspaceIntegration: Effect.fn(
          "@mason/integration/IntegrationModuleService.hardDeleteWorkspaceIntegration"
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
                    onNone: () => Effect.void,
                    onSome: (integration) =>
                      workspaceIntegrationRepo.hardDelete([integration.id]),
                  })
                )
              );

            return existing;
          },
          Effect.catchTags({
            "@mason/framework/DatabaseError": (e) =>
              Effect.fail(new InternalIntegrationModuleError({ cause: e })),
          })
        ),

        retrieveWorkspaceIntegration: Effect.fn(
          "@mason/integration/IntegrationModuleService.retrieveWorkspaceIntegration"
        )(
          function* (params) {
            const maybeWorkspaceIntegration =
              yield* workspaceIntegrationRepo.retrieve(params);

            return yield* Option.match(maybeWorkspaceIntegration, {
              onNone: () =>
                Effect.fail(new WorkspaceIntegrationNotFoundError()),
              onSome: Effect.succeed,
            });
          },
          Effect.catchTags({
            "@mason/framework/DatabaseError": (e) =>
              Effect.fail(new InternalIntegrationModuleError({ cause: e })),
          })
        ),

        listWorkspaceIntegrations: Effect.fn(
          "@mason/integration/IntegrationModuleService.listWorkspaceIntegrations"
        )(({ workspaceId }) =>
          workspaceIntegrationRepo.list({ workspaceId }).pipe(
            Effect.catchTags({
              "@mason/framework/DatabaseError": (e) =>
                Effect.fail(new InternalIntegrationModuleError({ cause: e })),
            })
          )
        ),

        retrieveWorkspaceApiKey: Effect.fn(
          "@mason/integration/IntegrationModuleService.retrieveWorkspaceApiKey"
        )(
          function* ({ workspaceId, kind }) {
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

            const decryptedApiKey = yield* _decryptApiKey(
              workspaceIntegration.encryptedApiKey
            );

            return decryptedApiKey;
          },
          Effect.catchTags({
            "@mason/framework/DatabaseError": (e) =>
              Effect.fail(new InternalIntegrationModuleError({ cause: e })),
          })
        ),
      });
    })
  );
}
