import { Context, Effect, Layer } from "effect";
import { MasonError } from "~/shared/errors";
import type {
  AssertWorkspaceSlugUniqueInput,
  AssertWorkspaceSlugUniqueOutput,
} from "./actions/assert-slug-unique";
import { AssertWorkspaceSlugUniqueAction } from "./actions/assert-slug-unique";
import type {
  CreateWorkspaceInput,
  CreateWorkspaceOutput,
} from "./actions/create";
import { CreateWorkspaceAction } from "./actions/create";
import type {
  PatchWorkspaceInput,
  PatchWorkspaceOutput,
} from "./actions/patch";
import { PatchWorkspaceAction } from "./actions/patch";
import type {
  RetrieveWorkspaceInput,
  RetrieveWorkspaceOutput,
} from "./actions/retrieve";
import { RetrieveWorkspaceAction } from "./actions/retrieve";
import type { WorkspaceSlugAlreadyExistsError } from "./domain/errors";
import type { WorkspaceNotFoundError } from "./errors";
import { WorkspaceRepository } from "./repositories/workspace.repo";

export class WorkspaceModuleService extends Context.Tag(
  "@mason/workspace/WorkspaceModuleService"
)<
  WorkspaceModuleService,
  {
    createWorkspace: (
      params: CreateWorkspaceInput
    ) => Effect.Effect<
      CreateWorkspaceOutput,
      WorkspaceSlugAlreadyExistsError | MasonError
    >;
    assertWorkspaceSlugUnique: (
      params: AssertWorkspaceSlugUniqueInput
    ) => Effect.Effect<
      AssertWorkspaceSlugUniqueOutput,
      WorkspaceSlugAlreadyExistsError | MasonError
    >;
    patchWorkspace: (
      params: PatchWorkspaceInput
    ) => Effect.Effect<
      PatchWorkspaceOutput,
      WorkspaceNotFoundError | WorkspaceSlugAlreadyExistsError | MasonError
    >;
    retrieveWorkspace: (
      params: RetrieveWorkspaceInput
    ) => Effect.Effect<RetrieveWorkspaceOutput, MasonError>;
  }
>() {
  static readonly live = Layer.effect(
    WorkspaceModuleService,
    Effect.gen(function* () {
      const workspaceRepo = yield* WorkspaceRepository;

      const services = Context.make(WorkspaceRepository, workspaceRepo);

      return WorkspaceModuleService.of({
        createWorkspace: (params) =>
          CreateWorkspaceAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              ParseError: (e) => Effect.fail(new MasonError({ cause: e })),
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),

        assertWorkspaceSlugUnique: (params) =>
          AssertWorkspaceSlugUniqueAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),

        patchWorkspace: (params) =>
          PatchWorkspaceAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              ParseError: (e) => Effect.fail(new MasonError({ cause: e })),
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),

        retrieveWorkspace: (params) =>
          RetrieveWorkspaceAction(params).pipe(
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
