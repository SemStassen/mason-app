import {
  CheckWorkspaceSlugIsUniqueFlow,
  CreateWorkspaceFlow,
  SetActiveWorkspaceFlow,
  UpdateWorkspaceFlow,
  WorkspaceRpcs,
} from "@mason/core";
import { Effect } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";

export const WorkspaceRpcsLive = WorkspaceRpcs.toLayer({
  "Workspace.Create": (request) =>
    CreateWorkspaceFlow(request).pipe(
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
  "Workspace.Update": (request) =>
    UpdateWorkspaceFlow(request).pipe(
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
  "Workspace.CheckSlugIsUnique": (request) =>
    CheckWorkspaceSlugIsUniqueFlow(request).pipe(
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
  "Workspace.SetActive": (request) =>
    SetActiveWorkspaceFlow(request).pipe(
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
});
