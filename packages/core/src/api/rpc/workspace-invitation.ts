import { AuthorizationError } from "@mason/authorization";
import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

import {
  WorkspaceInvitationEmailMismatchError,
  WorkspaceInvitationExpiredError,
  WorkspaceInvitationNotFoundError,
  WorkspaceInvitationNotPendingError,
} from "#modules/workspace-invitation/index";
import { WorkspaceMemberAlreadyExistsError } from "#modules/workspace-member/index";
import {
  AcceptWorkspaceInvitationCommand,
  AcceptWorkspaceInvitationResult,
  CancelWorkspaceInvitationCommand,
  CancelWorkspaceInvitationResult,
  CreateWorkspaceInvitationCommand,
  CreateWorkspaceInvitationResult,
  RejectWorkspaceInvitationCommand,
  RejectWorkspaceInvitationResult,
} from "../contracts";
import { SessionMiddleware, WorkspaceMiddleware } from "./middleware";

export const WorkspaceInvitationRpcGroup = RpcGroup.make(
  Rpc.make("WorkspaceInvitation.Create", {
    payload: CreateWorkspaceInvitationCommand,
    success: CreateWorkspaceInvitationResult,
    error: Schema.Union([
      AuthorizationError,
      WorkspaceMemberAlreadyExistsError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(SessionMiddleware)
    .middleware(WorkspaceMiddleware),

  Rpc.make("WorkspaceInvitation.Cancel", {
    payload: CancelWorkspaceInvitationCommand,
    success: CancelWorkspaceInvitationResult,
    error: Schema.Union([
      AuthorizationError,
      WorkspaceInvitationNotFoundError,
      WorkspaceInvitationNotPendingError,
      WorkspaceInvitationExpiredError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(SessionMiddleware)
    .middleware(WorkspaceMiddleware),

  Rpc.make("WorkspaceInvitation.Accept", {
    payload: AcceptWorkspaceInvitationCommand,
    success: AcceptWorkspaceInvitationResult,
    error: Schema.Union([
      WorkspaceMemberAlreadyExistsError,
      WorkspaceInvitationNotFoundError,
      WorkspaceInvitationEmailMismatchError,
      WorkspaceInvitationNotPendingError,
      WorkspaceInvitationExpiredError,
      HttpApiError.InternalServerError,
    ]),
  }).middleware(SessionMiddleware),

  Rpc.make("WorkspaceInvitation.Reject", {
    payload: RejectWorkspaceInvitationCommand,
    success: RejectWorkspaceInvitationResult,
    error: Schema.Union([
      WorkspaceInvitationNotFoundError,
      WorkspaceInvitationEmailMismatchError,
      WorkspaceInvitationNotPendingError,
      WorkspaceInvitationExpiredError,
      HttpApiError.InternalServerError,
    ]),
  }).middleware(SessionMiddleware)
);
