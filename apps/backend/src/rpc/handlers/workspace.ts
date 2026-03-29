import {
  checkWorkspaceSlugIsUniqueFlow,
  createWorkspaceFlow,
  listWorkspacesFlow,
  updateWorkspaceFlow,
} from "@mason/core-server/modules/workspace";
import { WorkspaceRpcGroup } from "@mason/core/rpc";
import { Effect } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";

export const WorkspaceRpcGroupLayer = WorkspaceRpcGroup.toLayer(
  Effect.succeed({
    "Workspace.Create": Effect.fn("rpc.workspace.create")(
      function* (payload) {
        const workspace = yield* createWorkspaceFlow(payload);

        return workspace;
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
        "infra/DatabaseError": () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
    "Workspace.Update": (payload) =>
      Effect.gen(function* () {
        const workspace = yield* updateWorkspaceFlow(payload);

        return workspace;
      }).pipe(
        Effect.catchTags({
          RepositoryError: () =>
            Effect.fail(new HttpApiError.InternalServerError()),
        })
      ),
    "Workspace.CheckSlugIsUnique": (payload) =>
      Effect.gen(function* () {
        const isUnique = yield* checkWorkspaceSlugIsUniqueFlow(payload);

        return isUnique;
      }).pipe(
        Effect.catchTags({
          RepositoryError: () =>
            Effect.fail(new HttpApiError.InternalServerError()),
        })
      ),

    "Workspace.List": (payload) =>
      Effect.gen(function* () {
        const workspaces = yield* listWorkspacesFlow(payload);

        return workspaces;
      }).pipe(
        Effect.catchTags({
          RepositoryError: () =>
            Effect.fail(new HttpApiError.InternalServerError()),
        })
      ),
  })
);
