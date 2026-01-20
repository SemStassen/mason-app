import { InternalServerError } from "@effect/platform/HttpApiError";
import {
  CheckWorkspaceSlugIsUniqueFlow,
  CreateWorkspaceFlow,
  PatchWorkspaceFlow,
  SetActiveWorkspaceFlow,
  WorkspaceRpcs,
} from "@mason/core";
import { Effect, pipe } from "effect";

export const WorkspaceRpcsLive = WorkspaceRpcs.toLayer({
  "Workspace.Create": (request) =>
    pipe(
      CreateWorkspaceFlow(request),
      Effect.catchTags({
        "shared/MasonError": () => new InternalServerError(),
        "identity/SessionNotFoundError": () => new InternalServerError(),
        "member/UserAlreadyWorkspaceMemberError": () =>
          new InternalServerError(),
        "infra/DatabaseError": () => new InternalServerError(),
      })
    ),
  "Workspace.Patch": (request) =>
    pipe(
      PatchWorkspaceFlow(request),
      Effect.catchTags({
        "shared/MasonError": () => new InternalServerError(),
      })
    ),
  "Workspace.CheckSlugIsUnique": (request) =>
    pipe(
      CheckWorkspaceSlugIsUniqueFlow(request),
      Effect.catchTags({
        "shared/MasonError": () => new InternalServerError(),
      })
    ),
  "Workspace.SetActive": (request) =>
    pipe(
      SetActiveWorkspaceFlow(request),
      Effect.catchTags({
        "shared/MasonError": () => new InternalServerError(),
        "identity/SessionNotFoundError": () => new InternalServerError(),
      })
    ),
});
