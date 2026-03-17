import {
  CheckWorkspaceSlugIsUniqueFlow,
  CreateWorkspaceFlow,
  SetActiveWorkspaceFlow,
  UpdateWorkspaceFlow,
} from "@mason/core/flows/workspace";
import { WorkspaceRpcGroup } from "@mason/core/rpc";
import { Effect } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";

export const WorkspaceRpcGroupLayer = WorkspaceRpcGroup.toLayer(
  Effect.gen(function* () {
    return {
      "Workspace.Create": (payload) =>
        Effect.gen(function* () {
          const workspace = yield* CreateWorkspaceFlow(payload);

          return workspace;
        }).pipe(
          Effect.catchTags({
            "infra/DatabaseError": () =>
              Effect.fail(new HttpApiError.InternalServerError()),
            RepositoryError: () =>
              Effect.fail(new HttpApiError.InternalServerError()),
          })
        ),
      "Workspace.Update": (payload) =>
        Effect.gen(function* () {
          const workspace = yield* UpdateWorkspaceFlow(payload);

          return workspace;
        }).pipe(
          Effect.catchTags({
            RepositoryError: () =>
              Effect.fail(new HttpApiError.InternalServerError()),
          })
        ),
      "Workspace.CheckSlugIsUnique": (payload) =>
        Effect.gen(function* () {
          const isUnique = yield* CheckWorkspaceSlugIsUniqueFlow(payload);

          return isUnique;
        }).pipe(
          Effect.catchTags({
            RepositoryError: () =>
              Effect.fail(new HttpApiError.InternalServerError()),
          })
        ),
      "Workspace.SetActive": (payload) =>
        Effect.gen(function* () {
          const workspace = yield* SetActiveWorkspaceFlow(payload);

          return workspace;
        }).pipe(
          Effect.catchTags({
            RepositoryError: () =>
              Effect.fail(new HttpApiError.InternalServerError()),
          })
        ),
    };
  })
);
