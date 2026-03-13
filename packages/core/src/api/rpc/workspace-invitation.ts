import { AuthorizationError } from "@mason/authorization";
import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";
import {
	AcceptWorkspaceInvitationRequest,
	AcceptWorkspaceInvitationResponse,
	CancelWorkspaceInvitationRequest,
	CancelWorkspaceInvitationResponse,
	CreateWorkspaceInvitationRequest,
	CreateWorkspaceInvitationResponse,
	RejectWorkspaceInvitationRequest,
	RejectWorkspaceInvitationResponse,
} from "~/flows";
import {
	WorkspaceInvitationEmailMismatchError,
	WorkspaceInvitationExpiredError,
	WorkspaceInvitationNotFoundError,
	WorkspaceInvitationNotPendingError,
} from "~/modules/workspace-invitation";
import { WorkspaceMemberAlreadyExistsError } from "~/modules/workspace-member";
import { SessionMiddleware, WorkspaceMiddleware } from "./middleware";

export const WorkspaceInvitationRpcs = RpcGroup.make(
	Rpc.make("WorkspaceInvitation.Create", {
		payload: CreateWorkspaceInvitationRequest,
		success: CreateWorkspaceInvitationResponse,
		error: Schema.Union([
			AuthorizationError,
			WorkspaceMemberAlreadyExistsError,
			HttpApiError.InternalServerError,
		]),
	})
		.middleware(SessionMiddleware)
		.middleware(WorkspaceMiddleware),

	Rpc.make("WorkspaceInvitation.Cancel", {
		payload: CancelWorkspaceInvitationRequest,
		success: CancelWorkspaceInvitationResponse,
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
		payload: AcceptWorkspaceInvitationRequest,
		success: AcceptWorkspaceInvitationResponse,
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
		payload: RejectWorkspaceInvitationRequest,
		success: RejectWorkspaceInvitationResponse,
		error: Schema.Union([
			WorkspaceInvitationNotFoundError,
			WorkspaceInvitationEmailMismatchError,
			WorkspaceInvitationNotPendingError,
			WorkspaceInvitationExpiredError,
			HttpApiError.InternalServerError,
		]),
	}).middleware(SessionMiddleware),
);
