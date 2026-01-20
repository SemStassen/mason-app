import { InternalServerError } from "@effect/platform/HttpApiError";
import { Rpc, RpcGroup } from "@effect/rpc";
import { AuthorizationError } from "@mason/authorization";
import { Schema } from "effect";
import {
  CheckWorkspaceSlugIsUniqueRequest,
  CheckWorkspaceSlugIsUniqueResponse,
  CreateWorkspaceRequest,
  PatchWorkspaceRequest,
  SetActiveWorkspaceRequest,
} from "~/flows";
import { UserNotWorkspaceMemberError } from "~/modules/member";
import {
  WorkspaceNotFoundError,
  WorkspaceSlugAlreadyExistsError,
} from "~/modules/workspace";
import { SessionMiddleware, WorkspaceMiddleware } from "./middleware";

export const WorkspaceRpcs = RpcGroup.make(
  Rpc.make("Workspace.Create", {
    payload: CreateWorkspaceRequest,
    success: Schema.Void,
    error: Schema.Union(WorkspaceSlugAlreadyExistsError, InternalServerError),
  }).middleware(SessionMiddleware),
  Rpc.make("Workspace.CheckSlugIsUnique", {
    payload: CheckWorkspaceSlugIsUniqueRequest,
    success: CheckWorkspaceSlugIsUniqueResponse,
    error: Schema.Union(InternalServerError),
  }).middleware(SessionMiddleware),
  Rpc.make("Workspace.Patch", {
    payload: PatchWorkspaceRequest,
    success: Schema.Void,
    error: Schema.Union(
      AuthorizationError,
      WorkspaceNotFoundError,
      WorkspaceSlugAlreadyExistsError,
      InternalServerError
    ),
  })
    .middleware(SessionMiddleware)
    .middleware(WorkspaceMiddleware),
  Rpc.make("Workspace.SetActive", {
    payload: SetActiveWorkspaceRequest,
    success: Schema.Void,
    error: Schema.Union(UserNotWorkspaceMemberError, InternalServerError),
  }).middleware(SessionMiddleware)
);
