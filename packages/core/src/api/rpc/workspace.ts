import { AuthorizationError } from "@mason/authorization";
import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

import { SessionNotFoundError } from "#modules/identity/identity.service";
import {
  WorkspaceNotFoundError,
  WorkspaceSlugAlreadyExistsError,
} from "#modules/workspace/index";
import { WorkspaceMemberNotFoundError } from "#modules/workspace-member/index";
import {
  CheckWorkspaceSlugIsUniqueCommand,
  CheckWorkspaceSlugIsUniqueResult,
  CreateWorkspaceCommand,
  CreateWorkspaceResult,
  SetActiveWorkspaceCommand,
  SetActiveWorkspaceResult,
  UpdateWorkspaceCommand,
  UpdateWorkspaceResult,
} from "../contracts";
import { SessionMiddleware, WorkspaceMiddleware } from "./middleware";

export const WorkspaceRpcGroup = RpcGroup.make(
  Rpc.make("Workspace.Create", {
    payload: CreateWorkspaceCommand,
    success: CreateWorkspaceResult,
    error: Schema.Union([
      WorkspaceSlugAlreadyExistsError,
      SessionNotFoundError,
      HttpApiError.InternalServerError,
    ]),
  }).middleware(SessionMiddleware),

  Rpc.make("Workspace.Update", {
    payload: UpdateWorkspaceCommand,
    success: UpdateWorkspaceResult,
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
    payload: CheckWorkspaceSlugIsUniqueCommand,
    success: CheckWorkspaceSlugIsUniqueResult,
    error: Schema.Union([HttpApiError.InternalServerError]),
  }).middleware(SessionMiddleware),

  Rpc.make("Workspace.SetActive", {
    payload: SetActiveWorkspaceCommand,
    success: SetActiveWorkspaceResult,
    error: Schema.Union([
      WorkspaceMemberNotFoundError,
      HttpApiError.InternalServerError,
    ]),
  }).middleware(SessionMiddleware)
);
