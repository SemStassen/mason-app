import { Context, Effect, Layer } from "effect";
import { MasonError } from "~/shared/errors";
import {
  AssertWorkspaceSlugUniqueAction,
  type AssertWorkspaceSlugUniqueInput,
  type AssertWorkspaceSlugUniqueOutput,
  CreateWorkspaceAction,
  type CreateWorkspaceInput,
  type CreateWorkspaceOutput,
  PatchWorkspaceAction,
  type PatchWorkspaceInput,
  type PatchWorkspaceOutput,
  RetrieveWorkspaceAction,
  type RetrieveWorkspaceInput,
  type RetrieveWorkspaceOutput,
} from "./actions";
import type { WorkspaceSlugAlreadyExistsError } from "./domain";
import type { WorkspaceNotFoundError } from "./errors";
import { WorkspaceRepository } from "./repositories/workspace.repo";

export class WorkspaceActionsService extends Context.Tag(
  "@mason/workspace/WorkspaceActionsService"
)<
  WorkspaceActionsService,
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
    WorkspaceActionsService,
    Effect.gen(function* () {
      const workspaceRepo = yield* WorkspaceRepository;

      const services = Context.make(WorkspaceRepository, workspaceRepo);

      return WorkspaceActionsService.of({
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
