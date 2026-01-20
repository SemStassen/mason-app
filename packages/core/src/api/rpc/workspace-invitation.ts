import { InternalServerError } from "@effect/platform/HttpApiError";
import { Rpc, RpcGroup } from "@effect/rpc";
import { AuthorizationError } from "@mason/authorization";
import { Schema } from "effect";
import {
  AcceptWorkspaceInvitationRequest,
  CancelWorkspaceInvitationRequest,
  CreateWorkspaceInvitationRequest,
  RejectWorkspaceInvitationRequest,
} from "~/flows";
import { WorkspaceInvitationExpiredError } from "~/modules/invitation";
import { UserAlreadyWorkspaceMemberError } from "~/modules/member";
import { SessionMiddleware, WorkspaceMiddleware } from "./middleware";

export const WorkspaceInvitationRpcs = RpcGroup.make(
  Rpc.make("WorkspaceInvitation.Create", {
    payload: CreateWorkspaceInvitationRequest,
    success: Schema.Void,
    error: Schema.Union(
      AuthorizationError,
      UserAlreadyWorkspaceMemberError,
      InternalServerError
    ),
  })
    .middleware(SessionMiddleware)
    .middleware(WorkspaceMiddleware),
  Rpc.make("WorkspaceInvitation.Cancel", {
    payload: CancelWorkspaceInvitationRequest,
    success: Schema.Void,
    error: Schema.Union(AuthorizationError, InternalServerError),
  })
    .middleware(SessionMiddleware)
    .middleware(WorkspaceMiddleware),
  Rpc.make("WorkspaceInvitation.Accept", {
    payload: AcceptWorkspaceInvitationRequest,
    success: Schema.Void,
    error: Schema.Union(
      WorkspaceInvitationExpiredError,
      UserAlreadyWorkspaceMemberError,
      InternalServerError
    ),
  }).middleware(SessionMiddleware),
  Rpc.make("WorkspaceInvitation.Reject", {
    payload: RejectWorkspaceInvitationRequest,
    success: Schema.Void,
    error: Schema.Union(WorkspaceInvitationExpiredError, InternalServerError),
  }).middleware(SessionMiddleware)
);
