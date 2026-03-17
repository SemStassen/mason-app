import { AuthorizationError } from "@mason/authorization";
import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";
import {
  CheckWorkspaceSlugIsUniqueRequest,
  CheckWorkspaceSlugIsUniqueResponse,
  CreateWorkspaceRequest,
  CreateWorkspaceResponse,
  SetActiveWorkspaceRequest,
  SetActiveWorkspaceResponse,
  UpdateWorkspaceRequest,
  UpdateWorkspaceResponse,
} from "#flows/workspace/index";
import {
  WorkspaceNotFoundError,
  WorkspaceSlugAlreadyExistsError,
} from "#modules/workspace/index";
import { WorkspaceMemberNotFoundError } from "#modules/workspace-member/index";
import { SessionMiddleware, WorkspaceMiddleware } from "./middleware";

export const WorkspaceRpcGroup = RpcGroup.make(
  Rpc.make("Workspace.Create", {
    payload: CreateWorkspaceRequest,
    success: CreateWorkspaceResponse,
    error: Schema.Union([
      WorkspaceSlugAlreadyExistsError,
      HttpApiError.InternalServerError,
    ]),
  }).middleware(SessionMiddleware),

  Rpc.make("Workspace.Update", {
    payload: UpdateWorkspaceRequest,
    success: UpdateWorkspaceResponse,
    error: Schema.Union([
      AuthorizationError,
      WorkspaceNotFoundError,
      WorkspaceSlugAlreadyExistsError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(SessionMiddleware)
    .middleware(WorkspaceMiddleware),

  Rpc.make("Workspace.CheckSlugIsUnique", {
    payload: CheckWorkspaceSlugIsUniqueRequest,
    success: CheckWorkspaceSlugIsUniqueResponse,
    error: Schema.Union([HttpApiError.InternalServerError]),
  }).middleware(SessionMiddleware),

  Rpc.make("Workspace.SetActive", {
    payload: SetActiveWorkspaceRequest,
    success: SetActiveWorkspaceResponse,
    error: Schema.Union([
      WorkspaceMemberNotFoundError,
      HttpApiError.InternalServerError,
    ]),
  }).middleware(SessionMiddleware)
);
