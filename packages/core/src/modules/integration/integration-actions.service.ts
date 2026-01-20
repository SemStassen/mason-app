import { Context, Effect, Layer } from "effect";
import { MasonError } from "~/shared/errors";
import {
  CreateWorkspaceIntegrationAction,
  type CreateWorkspaceIntegrationInput,
  type CreateWorkspaceIntegrationOutput,
  HardDeleteWorkspaceIntegrationAction,
  type HardDeleteWorkspaceIntegrationInput,
  type HardDeleteWorkspaceIntegrationOutput,
  ListWorkspaceIntegrationsAction,
  type ListWorkspaceIntegrationsInput,
  type ListWorkspaceIntegrationsOutput,
  PatchWorkspaceIntegrationAction,
  type PatchWorkspaceIntegrationInput,
  type PatchWorkspaceIntegrationOutput,
  RetrieveWorkspaceIntegrationAction,
  type RetrieveWorkspaceIntegrationInput,
  type RetrieveWorkspaceIntegrationOutput,
} from "./actions";
import type { WorkspaceIntegrationProviderAlreadyExistsError } from "./domain";
import type { WorkspaceIntegrationNotFoundError } from "./errors";
import { WorkspaceIntegrationRepository } from "./repositories";

export class IntegrationActionsService extends Context.Tag(
  "@mason/integration/IntegrationActionsService"
)<
  IntegrationActionsService,
  {
    createWorkspaceIntegration: (
      params: CreateWorkspaceIntegrationInput
    ) => Effect.Effect<
      CreateWorkspaceIntegrationOutput,
      WorkspaceIntegrationProviderAlreadyExistsError | MasonError
    >;
    patchWorkspaceIntegration: (
      params: PatchWorkspaceIntegrationInput
    ) => Effect.Effect<
      PatchWorkspaceIntegrationOutput,
      WorkspaceIntegrationNotFoundError | MasonError
    >;
    retrieveWorkspaceIntegration: (
      params: RetrieveWorkspaceIntegrationInput
    ) => Effect.Effect<RetrieveWorkspaceIntegrationOutput, MasonError>;
    listWorkspaceIntegrations: (
      params: ListWorkspaceIntegrationsInput
    ) => Effect.Effect<ListWorkspaceIntegrationsOutput, MasonError>;
    hardDeleteWorkspaceIntegration: (
      params: HardDeleteWorkspaceIntegrationInput
    ) => Effect.Effect<
      HardDeleteWorkspaceIntegrationOutput,
      WorkspaceIntegrationNotFoundError | MasonError
    >;
  }
>() {
  static readonly live = Layer.effect(
    IntegrationActionsService,
    Effect.gen(function* () {
      const workspaceIntegrationRepo = yield* WorkspaceIntegrationRepository;

      const services = Context.make(
        WorkspaceIntegrationRepository,
        workspaceIntegrationRepo
      );

      return IntegrationActionsService.of({
        createWorkspaceIntegration: (params) =>
          CreateWorkspaceIntegrationAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              ParseError: (e) => Effect.fail(new MasonError({ cause: e })),
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),

        patchWorkspaceIntegration: (params) =>
          PatchWorkspaceIntegrationAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              ParseError: (e) => Effect.fail(new MasonError({ cause: e })),
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),

        retrieveWorkspaceIntegration: (params) =>
          RetrieveWorkspaceIntegrationAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),

        listWorkspaceIntegrations: (params) =>
          ListWorkspaceIntegrationsAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),

        hardDeleteWorkspaceIntegration: (params) =>
          HardDeleteWorkspaceIntegrationAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),
      });
    })
  );
}
