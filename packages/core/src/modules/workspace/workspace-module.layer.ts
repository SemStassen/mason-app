import { Effect, Layer, Option } from "effect";

import * as workspaceTransitions from "./domain/workspace.transitions";
import {
  WorkspaceModule,
  WorkspaceNotFoundError,
  WorkspaceSlugAlreadyExistsError,
} from "./workspace-module.service";
import { WorkspaceRepository } from "./workspace-repository.service";

export const WorkspaceModuleLayer = Layer.effect(
  WorkspaceModule,
  Effect.gen(function* () {
    const workspaceRepo = yield* WorkspaceRepository;

    const assertWorkspaceSlugIsUnique = Effect.fn(
      "workspace.assertWorkspaceSlugIsUnique"
    )(function* (slug: string) {
      const maybeWorkspace = yield* workspaceRepo.findBySlug(slug);

      if (Option.isSome(maybeWorkspace)) {
        return yield* new WorkspaceSlugAlreadyExistsError();
      }
    });

    return {
      createWorkspace: Effect.fn("workspace.createWorkspace")(function* (data) {
        yield* assertWorkspaceSlugIsUnique(data.slug);

        const workspace = yield* Effect.fromResult(
          workspaceTransitions.createWorkspace(data)
        );

        const persistedWorkspace = yield* workspaceRepo.insert(workspace);

        return persistedWorkspace;
      }),
      updateWorkspace: Effect.fn("workspace.updateWorkspace")(
        function* (params) {
          const workspace = yield* workspaceRepo.findById(params.id).pipe(
            Effect.flatMap(
              Option.match({
                onNone: () =>
                  Effect.fail(
                    new WorkspaceNotFoundError({
                      workspaceId: params.id,
                    })
                  ),
                onSome: Effect.succeed,
              })
            )
          );

          if (params.data.slug) {
            yield* assertWorkspaceSlugIsUnique(params.data.slug);
          }

          const { changes, entity } = yield* Effect.fromResult(
            workspaceTransitions.updateWorkspace({
              workspace,
              data: params.data,
            })
          );

          const persistedWorkspace = yield* workspaceRepo.update({
            id: entity.id,
            update: changes,
          });

          return persistedWorkspace;
        }
      ),
      checkWorkspaceSlugAvailability: Effect.fn(
        "workspace.checkWorkspaceSlugAvailability"
      )(function* (slug) {
        const maybeWorkspace = yield* workspaceRepo.findBySlug(slug);

        return Option.isNone(maybeWorkspace);
      }),
      listWorkspacesByIds: Effect.fn("workspace.listWorkspacesByIds")(
        function* (ids) {
          const workspaces = yield* workspaceRepo.listByIds(ids);

          return workspaces;
        }
      ),
    };
  })
);
