import { DateTime, Result } from "effect";
import { WorkspaceInvitation } from "./workspace-invitation.entity";
import {
	WorkspaceInvitationEmailMismatchError,
	WorkspaceInvitationExpiredError,
	WorkspaceInvitationNotPendingError,
} from "./workspace-invitation.errors";

const ensurePending = (
	workspaceInvitation: WorkspaceInvitation,
): Result.Result<void, WorkspaceInvitationNotPendingError> =>
	workspaceInvitation.isPending()
		? Result.succeed(undefined)
		: Result.fail(new WorkspaceInvitationNotPendingError());

const ensureNotExpired = (
	workspaceInvitation: WorkspaceInvitation,
	now: DateTime.Utc,
): Result.Result<void, WorkspaceInvitationExpiredError> =>
	DateTime.isLessThanOrEqualTo(now, workspaceInvitation.expiresAt)
		? Result.succeed(undefined)
		: Result.fail(new WorkspaceInvitationExpiredError());

const ensureEmailMatches = (
	workspaceInvitation: WorkspaceInvitation,
	email: WorkspaceInvitation["email"],
): Result.Result<void, WorkspaceInvitationEmailMismatchError> =>
	workspaceInvitation.email === email
		? Result.succeed(undefined)
		: Result.fail(new WorkspaceInvitationEmailMismatchError());

export const renewWorkspaceInvitation = (params: {
	workspaceInvitation: WorkspaceInvitation;
	now: DateTime.Utc;
}): Result.Result<
	WorkspaceInvitation,
	WorkspaceInvitationNotPendingError | WorkspaceInvitationExpiredError
> =>
	Result.gen(function* () {
		yield* ensurePending(params.workspaceInvitation);
		yield* ensureNotExpired(params.workspaceInvitation, params.now);
		return WorkspaceInvitation.make({
			...params.workspaceInvitation,
			expiresAt: WorkspaceInvitation.defaultExpiration(params.now),
		});
	});

export const cancelWorkspaceInvitation = (params: {
	workspaceInvitation: WorkspaceInvitation;
	now: DateTime.Utc;
}): Result.Result<
	WorkspaceInvitation,
	WorkspaceInvitationNotPendingError | WorkspaceInvitationExpiredError
> =>
	Result.gen(function* () {
		yield* ensurePending(params.workspaceInvitation);
		yield* ensureNotExpired(params.workspaceInvitation, params.now);

		return WorkspaceInvitation.make({
			...params.workspaceInvitation,
			status: "canceled",
		});
	});

export const acceptWorkspaceInvitation = (params: {
	workspaceInvitation: WorkspaceInvitation;
	email: WorkspaceInvitation["email"];
	now: DateTime.Utc;
}): Result.Result<
	WorkspaceInvitation,
	| WorkspaceInvitationNotPendingError
	| WorkspaceInvitationExpiredError
	| WorkspaceInvitationEmailMismatchError
> =>
	Result.gen(function* () {
		yield* ensurePending(params.workspaceInvitation);
		yield* ensureNotExpired(params.workspaceInvitation, params.now);
		yield* ensureEmailMatches(params.workspaceInvitation, params.email);

		return WorkspaceInvitation.make({
			...params.workspaceInvitation,
			status: "accepted",
		});
	});

export const rejectWorkspaceInvitation = (params: {
	workspaceInvitation: WorkspaceInvitation;
	email: WorkspaceInvitation["email"];
	now: DateTime.Utc;
}): Result.Result<
	WorkspaceInvitation,
	| WorkspaceInvitationNotPendingError
	| WorkspaceInvitationExpiredError
	| WorkspaceInvitationEmailMismatchError
> =>
	Result.gen(function* () {
		yield* ensurePending(params.workspaceInvitation);
		yield* ensureNotExpired(params.workspaceInvitation, params.now);
		yield* ensureEmailMatches(params.workspaceInvitation, params.email);

		return WorkspaceInvitation.make({
			...params.workspaceInvitation,
			status: "rejected",
		});
	});
