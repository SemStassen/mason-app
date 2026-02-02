import { Context, Effect, Layer } from "effect";
import { MasonError } from "~/shared/errors";
import type {
  CreateWorkspaceIntegrationInput,
  CreateWorkspaceIntegrationOutput,
} from "./actions/create";
import { CreateWorkspaceIntegrationAction } from "./actions/create";
import type {
  HardDeleteWorkspaceIntegrationInput,
  HardDeleteWorkspaceIntegrationOutput,
} from "./actions/hard-delete";
import { HardDeleteWorkspaceIntegrationAction } from "./actions/hard-delete";
import type {
  ListWorkspaceIntegrationsInput,
  ListWorkspaceIntegrationsOutput,
} from "./actions/list";
import { ListWorkspaceIntegrationsAction } from "./actions/list";
import type {
  PatchWorkspaceIntegrationInput,
  PatchWorkspaceIntegrationOutput,
} from "./actions/patch";
import { PatchWorkspaceIntegrationAction } from "./actions/patch";
import type {
  RetrieveWorkspaceIntegrationInput,
  RetrieveWorkspaceIntegrationOutput,
} from "./actions/retrieve";
import { RetrieveWorkspaceIntegrationAction } from "./actions/retrieve";
import type { WorkspaceIntegrationProviderAlreadyExistsError } from "./domain/errors";
import type { WorkspaceIntegrationNotFoundError } from "./errors";
import { WorkspaceIntegrationRepository } from "./repositories/workspace-integration.repo";

export class IntegrationModuleService extends Context.Tag(
  "@mason/integration/IntegrationModuleService"
)<
  IntegrationModuleService,
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
    IntegrationModuleService,
    Effect.gen(function* () {
      const workspaceIntegrationRepo = yield* WorkspaceIntegrationRepository;

      const services = Context.make(
        WorkspaceIntegrationRepository,
        workspaceIntegrationRepo
      );

      return IntegrationModuleService.of({
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
