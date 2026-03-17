import {
  checkWorkspaceSlugIsUniqueFlow,
  createWorkspaceFlow,
  setActiveWorkspaceFlow,
  updateWorkspaceFlow,
} from "@mason/core/flows/workspace";
import { WorkspaceRpcGroup } from "@mason/core/rpc";
import { Effect } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { mapInfraErrors } from "../../utils";

export const WorkspaceRpcGroupLayer = WorkspaceRpcGroup.toLayer(
  Effect.gen(function* () {
    return {
      "Workspace.Create": (payload) =>
        Effect.gen(function* () {
          const workspace = yield* createWorkspaceFlow(payload);

          return workspace;
        }).pipe(mapInfraErrors()),
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
      "Workspace.SetActive": (payload) =>
        Effect.gen(function* () {
          const workspace = yield* setActiveWorkspaceFlow(payload);

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
