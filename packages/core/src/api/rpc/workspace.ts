import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

import {
  CheckWorkspaceSlugIsUniqueCommand,
  CheckWorkspaceSlugIsUniqueResult,
  CreateWorkspaceCommand,
  CreateWorkspaceResult,
  ListWorkspacesCommand,
  ListWorkspacesResult,
  UpdateWorkspaceCommand,
  UpdateWorkspaceResult,
} from "#api/contracts/index";
import { SessionNotFoundError } from "#modules/identity/identity-module.service";
import {
  WorkspaceNotFoundError,
  WorkspaceSlugAlreadyExistsError,
} from "#modules/workspace/index";
import { AuthorizationError } from "#shared/authorization/index";

import { RpcSessionMiddleware, RpcWorkspaceMiddleware } from "./middleware";

export const WorkspaceRpcGroup = RpcGroup.make(
  Rpc.make("Workspace.Create", {
    payload: CreateWorkspaceCommand,
    success: CreateWorkspaceResult,
    error: Schema.Union([
      WorkspaceSlugAlreadyExistsError,
      SessionNotFoundError,
      HttpApiError.InternalServerError,
    ]),
  }).middleware(RpcSessionMiddleware),

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
    .middleware(RpcSessionMiddleware)
    .middleware(RpcWorkspaceMiddleware),

  Rpc.make("Workspace.CheckSlugIsUnique", {
    payload: CheckWorkspaceSlugIsUniqueCommand,
    success: CheckWorkspaceSlugIsUniqueResult,
    error: Schema.Union([HttpApiError.InternalServerError]),
  }).middleware(RpcSessionMiddleware),

  Rpc.make("Workspace.List", {
    payload: ListWorkspacesCommand,
    success: ListWorkspacesResult,
    error: Schema.Union([HttpApiError.InternalServerError]),
  }).middleware(RpcSessionMiddleware)
);
