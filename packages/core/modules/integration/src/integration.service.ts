import {
  CryptoService,
  EncryptedApiKey,
  type MemberId,
  PlainApiKey,
  processArray,
  type WorkspaceId,
  WorkspaceIntegrationId,
} from "@mason/framework";
import { Context, Effect, Layer, Option, Redacted } from "effect";
import { WorkspaceIntegration } from "./domain/workspace-integration.model";
import {
  WorkspaceIntegrationToCreate,
  WorkspaceIntegrationToUpdate,
} from "./dto";
import {
  InternalIntegrationModuleError,
  WorkspaceIntegrationNotFoundError,
} from "./errors";
import { WorkspaceIntegrationRepository } from "./repositories/workspace-integration.repo";

export class IntegrationService extends Context.Tag(
  "@mason/integration/IntegrationService"
)<
  IntegrationService,
  {
    createWorkspaceIntegrations: (params: {
      workspaceId: WorkspaceId;
      createdByMemberId: MemberId;
      workspaceIntegrations: ReadonlyArray<WorkspaceIntegrationToCreate>;
    }) => Effect.Effect<
      ReadonlyArray<WorkspaceIntegration>,
      InternalIntegrationModuleError
    >;
    updateWorkspaceIntegrations: (params: {
      workspaceId: WorkspaceId;
      workspaceIntegrations: ReadonlyArray<WorkspaceIntegrationToUpdate>;
    }) => Effect.Effect<
      ReadonlyArray<WorkspaceIntegration>,
      InternalIntegrationModuleError | WorkspaceIntegrationNotFoundError
    >;
    hardDeleteWorkspaceIntegrations: (params: {
      workspaceId: WorkspaceId;
      workspaceIntegrationIds: ReadonlyArray<WorkspaceIntegrationId>;
    }) => Effect.Effect<void, InternalIntegrationModuleError>;
    retrieveWorkspaceIntegration: (params: {
      workspaceId: WorkspaceId;
      query?: {
        id?: WorkspaceIntegrationId;
        kind?: "float";
      };
    }) => Effect.Effect<
      WorkspaceIntegration,
      InternalIntegrationModuleError | WorkspaceIntegrationNotFoundError
    >;
    listWorkspaceIntegrations: (params: {
      workspaceId: WorkspaceId;
      query?: {
        ids?: ReadonlyArray<WorkspaceIntegrationId>;
      };
    }) => Effect.Effect<
      ReadonlyArray<WorkspaceIntegration>,
      InternalIntegrationModuleError
    >;
    retrieveWorkspaceApiKey: (params: {
      workspaceId: WorkspaceId;
      kind: "float";
    }) => Effect.Effect<
      PlainApiKey,
      InternalIntegrationModuleError | WorkspaceIntegrationNotFoundError
    >;
  }
>() {
  static readonly live = Layer.effect(
    IntegrationService,
    Effect.gen(function* () {
      const workspaceIntegrationRepo = yield* WorkspaceIntegrationRepository;
      const cryptoService = yield* CryptoService;

      const _encryptApiKey = (plainApiKey: PlainApiKey) =>
        cryptoService
          .encrypt(Redacted.value(plainApiKey))
          .pipe(
            Effect.map((encrypted) =>
              Redacted.make(EncryptedApiKey.from.make(encrypted))
            )
          );

      const _decryptApiKey = (encryptedApiKey: EncryptedApiKey) =>
        cryptoService
          .decrypt(Redacted.value(encryptedApiKey))
          .pipe(
            Effect.map((decrypted) =>
              Redacted.make(PlainApiKey.from.make(decrypted))
            )
          );

      return IntegrationService.of({
        createWorkspaceIntegrations: Effect.fn(
          "@mason/integration/IntegrationService.createWorkspaceIntegrations"
        )(function* ({
          workspaceId,
          createdByMemberId,
          workspaceIntegrations,
        }) {
          return yield* processArray({
            items: workspaceIntegrations,
            schema: WorkspaceIntegrationToCreate,
            mapItem: (workspaceIntegration) =>
              Effect.gen(function* () {
                const encryptedApiKey = yield* _encryptApiKey(
                  workspaceIntegration.plainApiKey
                );

                return yield* WorkspaceIntegration.makeFromCreate(
                  { ...workspaceIntegration, encryptedApiKey },
                  workspaceId,
                  createdByMemberId
                );
              }),
            execute: (workspaceIntegrationsToCreate) =>
              workspaceIntegrationRepo.insert(workspaceIntegrationsToCreate),
            onEmpty: Effect.succeed([]),
          }).pipe(
            Effect.catchTags({
              ParseError: (e) =>
                Effect.fail(new InternalIntegrationModuleError({ cause: e })),
              SqlError: (e) =>
                Effect.fail(new InternalIntegrationModuleError({ cause: e })),
            })
          );
        }),

        updateWorkspaceIntegrations: Effect.fn(
          "@mason/integration/IntegrationService.updateWorkspaceIntegrations"
        )(({ workspaceId, workspaceIntegrations }) =>
          processArray({
            items: workspaceIntegrations,
            schema: WorkspaceIntegrationToUpdate,
            prepare: (updates) =>
              Effect.gen(function* () {
                const existingIntegrations =
                  yield* workspaceIntegrationRepo.list({
                    workspaceId,
                    query: { ids: updates.map((u) => u.id) },
                  });

                const existingMap = new Map(
                  existingIntegrations.map((e) => [e.id, e])
                );
                return existingMap;
              }),
            mapItem: (update, existingMap) =>
              Effect.gen(function* () {
                const existing = existingMap.get(update.id);
                if (!existing) {
                  return yield* Effect.fail(
                    new WorkspaceIntegrationNotFoundError()
                  );
                }

                const encryptedApiKey = update.plainApiKey
                  ? yield* _encryptApiKey(update.plainApiKey)
                  : existing.encryptedApiKey;

                return yield* existing.patch({
                  ...update,
                  encryptedApiKey,
                });
              }),
            execute: (updated) => workspaceIntegrationRepo.update(updated),
            onEmpty: Effect.succeed([]),
          }).pipe(
            Effect.catchTags({
              ParseError: (e) =>
                Effect.fail(new InternalIntegrationModuleError({ cause: e })),
              SqlError: (e) =>
                Effect.fail(new InternalIntegrationModuleError({ cause: e })),
            })
          )
        ),

        hardDeleteWorkspaceIntegrations: Effect.fn(
          "@mason/integration/IntegrationService.hardDeleteWorkspaceIntegrations"
        )(({ workspaceId, workspaceIntegrationIds }) =>
          processArray({
            items: workspaceIntegrationIds,
            schema: WorkspaceIntegrationId,
            onEmpty: Effect.void,
            execute: (nea) =>
              Effect.gen(function* () {
                const existingIntegrations =
                  yield* workspaceIntegrationRepo.list({
                    workspaceId,
                    query: {
                      ids: nea,
                    },
                  });

                yield* processArray({
                  items: existingIntegrations.map((existing) => existing.id),
                  schema: WorkspaceIntegrationId,
                  onEmpty: Effect.void,
                  execute: (nea) => workspaceIntegrationRepo.hardDelete(nea),
                });
              }),
          }).pipe(
            Effect.catchTags({
              ParseError: (e) =>
                Effect.fail(new InternalIntegrationModuleError({ cause: e })),
              SqlError: (e) =>
                Effect.fail(new InternalIntegrationModuleError({ cause: e })),
            })
          )
        ),

        retrieveWorkspaceIntegration: Effect.fn(
          "@mason/integration/IntegrationService.retrieveWorkspaceIntegration"
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
            ParseError: (e) =>
              Effect.fail(new InternalIntegrationModuleError({ cause: e })),
            SqlError: (e) =>
              Effect.fail(new InternalIntegrationModuleError({ cause: e })),
          })
        ),

        listWorkspaceIntegrations: Effect.fn(
          "@mason/integration/IntegrationService.listWorkspaceIntegrations"
        )(({ workspaceId }) =>
          workspaceIntegrationRepo.list({ workspaceId }).pipe(
            Effect.catchTags({
              ParseError: (e) =>
                Effect.fail(new InternalIntegrationModuleError({ cause: e })),
              SqlError: (e) =>
                Effect.fail(new InternalIntegrationModuleError({ cause: e })),
            })
          )
        ),

        retrieveWorkspaceApiKey: Effect.fn(
          "@mason/integration/IntegrationService.retrieveWorkspaceApiKey"
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
            ParseError: (e) =>
              Effect.fail(new InternalIntegrationModuleError({ cause: e })),
            SqlError: (e) =>
              Effect.fail(new InternalIntegrationModuleError({ cause: e })),
          })
        ),
      });
    })
  );
}
