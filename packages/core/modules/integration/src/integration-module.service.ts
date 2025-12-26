import {
  CryptoService,
  EncryptedApiKey,
  type ExistingMemberId,
  type ExistingWorkspaceId,
  ExistingWorkspaceIntegrationId,
  PlainApiKey,
  processArray,
  WorkspaceIntegrationId,
} from "@mason/framework";
import { Context, Effect, Layer, Option, Redacted } from "effect";
import type { ParseError } from "effect/ParseResult";
import type {
  WorkspaceIntegrationToCreateDTO,
  WorkspaceIntegrationToUpdateDTO,
} from "./dto";
import {
  InternalIntegrationModuleError,
  WorkspaceIntegrationNotFoundError,
} from "./errors";
import {
  createWorkspaceIntegration,
  updateWorkspaceIntegration,
  type WorkspaceIntegration,
} from "./workspace-integration";
import { WorkspaceIntegrationRepository } from "./workspace-integration.repo";

export class IntegrationModuleService extends Context.Tag(
  "@mason/integration/IntegrationModuleService"
)<
  IntegrationModuleService,
  {
    createWorkspaceIntegrations: (params: {
      workspaceId: ExistingWorkspaceId;
      createdByMemberId: ExistingMemberId;
      workspaceIntegrations: ReadonlyArray<WorkspaceIntegrationToCreateDTO>;
    }) => Effect.Effect<
      ReadonlyArray<WorkspaceIntegration>,
      InternalIntegrationModuleError
    >;
    updateWorkspaceIntegrations: (params: {
      workspaceId: ExistingWorkspaceId;
      workspaceIntegrations: ReadonlyArray<WorkspaceIntegrationToUpdateDTO>;
    }) => Effect.Effect<
      ReadonlyArray<WorkspaceIntegration>,
      InternalIntegrationModuleError | WorkspaceIntegrationNotFoundError
    >;
    hardDeleteWorkspaceIntegrations: (params: {
      workspaceId: ExistingWorkspaceId;
      workspaceIntegrationIds: ReadonlyArray<WorkspaceIntegrationId>;
    }) => Effect.Effect<void, InternalIntegrationModuleError>;
    retrieveWorkspaceIntegration: (params: {
      workspaceId: ExistingWorkspaceId;
      query?: {
        id?: WorkspaceIntegrationId;
        kind?: "float";
      };
    }) => Effect.Effect<
      WorkspaceIntegration,
      InternalIntegrationModuleError | WorkspaceIntegrationNotFoundError
    >;
    listWorkspaceIntegrations: (params: {
      workspaceId: ExistingWorkspaceId;
      query?: {
        ids?: ReadonlyArray<WorkspaceIntegrationId>;
      };
    }) => Effect.Effect<
      ReadonlyArray<WorkspaceIntegration>,
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
        createWorkspaceIntegrations: Effect.fn(
          "@mason/integration/WorkspaceIntegrationModuleService.createWorkspaceIntegrations"
        )(
          function* ({
            workspaceId,
            createdByMemberId,
            workspaceIntegrations,
          }) {
            return yield* processArray({
              items: workspaceIntegrations,
              mapItem: (workspaceIntegration) =>
                Effect.gen(function* () {
                  const encryptedApiKey = yield* _encryptApiKey(
                    workspaceIntegration.plainApiKey
                  );

                  return yield* createWorkspaceIntegration({
                    ...workspaceIntegration,
                    encryptedApiKey,
                    workspaceId,
                    createdByMemberId,
                  });
                }),
              execute: (workspaceIntegrationsToCreate) =>
                workspaceIntegrationRepo.insert(workspaceIntegrationsToCreate),
              onEmpty: Effect.succeed([]),
            });
          },
          Effect.catchTags({
            "@mason/framework/DatabaseError": (e) =>
              Effect.fail(new InternalIntegrationModuleError({ cause: e })),
            ParseError: (e: ParseError) =>
              Effect.fail(new InternalIntegrationModuleError({ cause: e })),
          })
        ),

        updateWorkspaceIntegrations: Effect.fn(
          "@mason/integration/WorkspaceIntegrationModuleService.updateWorkspaceIntegrations"
        )(({ workspaceId, workspaceIntegrations }) =>
          processArray({
            items: workspaceIntegrations,
            prepare: (updates) =>
              Effect.gen(function* () {
                const existingIntegrations =
                  yield* workspaceIntegrationRepo.list({
                    workspaceId,
                    query: { ids: updates.map((u) => u.id) },
                  });

                const existingMap = new Map(
                  existingIntegrations.map((e) => [
                    WorkspaceIntegrationId.make(e.id),
                    e,
                  ])
                );

                return existingMap;
              }),
            mapItem: (updateDto, existingMap) =>
              Effect.gen(function* () {
                const existing = existingMap.get(updateDto.id);
                if (!existing) {
                  return yield* Effect.fail(
                    new WorkspaceIntegrationNotFoundError()
                  );
                }

                const encryptedApiKey = updateDto.plainApiKey
                  ? yield* _encryptApiKey(updateDto.plainApiKey)
                  : existing.encryptedApiKey;

                return yield* updateWorkspaceIntegration(existing, {
                  ...updateDto,
                  encryptedApiKey,
                });
              }),
            execute: (updated) => workspaceIntegrationRepo.update(updated),
            onEmpty: Effect.succeed([]),
          }).pipe(
            Effect.catchTags({
              "@mason/framework/DatabaseError": (e) =>
                Effect.fail(new InternalIntegrationModuleError({ cause: e })),
              ParseError: (e: ParseError) =>
                Effect.fail(new InternalIntegrationModuleError({ cause: e })),
            })
          )
        ),

        hardDeleteWorkspaceIntegrations: Effect.fn(
          "@mason/integration/WorkspaceIntegrationModuleService.hardDeleteWorkspaceIntegrations"
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
                  schema: ExistingWorkspaceIntegrationId,
                  onEmpty: Effect.void,
                  execute: (nea) => workspaceIntegrationRepo.hardDelete(nea),
                });
              }),
          }).pipe(
            Effect.catchTags({
              "@mason/framework/DatabaseError": (e) =>
                Effect.fail(new InternalIntegrationModuleError({ cause: e })),
              ParseError: (e: ParseError) =>
                Effect.fail(new InternalIntegrationModuleError({ cause: e })),
            })
          )
        ),

        retrieveWorkspaceIntegration: Effect.fn(
          "@mason/integration/WorkspaceIntegrationModuleService.retrieveWorkspaceIntegration"
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
          "@mason/integration/WorkspaceIntegrationModuleService.listWorkspaceIntegrations"
        )(({ workspaceId }) =>
          workspaceIntegrationRepo.list({ workspaceId }).pipe(
            Effect.catchTags({
              "@mason/framework/DatabaseError": (e) =>
                Effect.fail(new InternalIntegrationModuleError({ cause: e })),
            })
          )
        ),

        retrieveWorkspaceApiKey: Effect.fn(
          "@mason/integration/WorkspaceIntegrationModuleService.retrieveWorkspaceApiKey"
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
