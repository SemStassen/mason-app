import { DateTime, Result } from "effect";
import { WorkspaceInvitationId } from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";
import { WorkspaceInvitation } from "./workspace-invitation.entity";
import {
	WorkspaceInvitationEmailMismatchError,
	WorkspaceInvitationExpiredError,
	WorkspaceInvitationNotPendingError,
} from "./workspace-invitation.errors";

const defaultExpiration = (now: DateTime.Utc): DateTime.Utc =>
	DateTime.add(now, { days: 2 });

export const createWorkspaceInvitation = (params: {
	workspaceId: WorkspaceInvitation["workspaceId"];
	inviterId: WorkspaceInvitation["inviterId"];
	data: typeof WorkspaceInvitation.jsonCreate.Type;
	now: DateTime.Utc;
}): Result.Result<WorkspaceInvitation, never> =>
	Result.succeed(
		WorkspaceInvitation.make({
			id: WorkspaceInvitationId.makeUnsafe(generateUUID()),
			workspaceId: params.workspaceId,
			inviterId: params.inviterId,
			email: params.data.email,
			role: params.data.role,
			status: "pending",
			expiresAt: defaultExpiration(params.now),
		}),
	);

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
	{
		entity: WorkspaceInvitation;
		changes: typeof WorkspaceInvitation.update.Type;
	},
	WorkspaceInvitationNotPendingError | WorkspaceInvitationExpiredError
> =>
	Result.gen(function* () {
		yield* ensurePending(params.workspaceInvitation);
		yield* ensureNotExpired(params.workspaceInvitation, params.now);

		const changes = { expiresAt: defaultExpiration(params.now) };

		return {
			entity: WorkspaceInvitation.make({
				...params.workspaceInvitation,
				...changes,
			}),
			changes: changes,
		};
	});

export const cancelWorkspaceInvitation = (params: {
	workspaceInvitation: WorkspaceInvitation;
	now: DateTime.Utc;
}): Result.Result<
	{
		entity: WorkspaceInvitation;
		changes: typeof WorkspaceInvitation.update.Type;
	},
	WorkspaceInvitationNotPendingError | WorkspaceInvitationExpiredError
> =>
	Result.gen(function* () {
		yield* ensurePending(params.workspaceInvitation);
		yield* ensureNotExpired(params.workspaceInvitation, params.now);

		const changes = { status: "canceled" as const };

		return {
			entity: WorkspaceInvitation.make({
				...params.workspaceInvitation,
				...changes,
			}),
			changes: changes,
		};
	});

export const acceptWorkspaceInvitation = (params: {
	workspaceInvitation: WorkspaceInvitation;
	email: WorkspaceInvitation["email"];
	now: DateTime.Utc;
}): Result.Result<
	{
		entity: WorkspaceInvitation;
		changes: typeof WorkspaceInvitation.update.Type;
	},
	| WorkspaceInvitationNotPendingError
	| WorkspaceInvitationExpiredError
	| WorkspaceInvitationEmailMismatchError
> =>
	Result.gen(function* () {
		yield* ensurePending(params.workspaceInvitation);
		yield* ensureNotExpired(params.workspaceInvitation, params.now);
		yield* ensureEmailMatches(params.workspaceInvitation, params.email);

		const changes = { status: "accepted" as const };

		return {
			entity: WorkspaceInvitation.make({
				...params.workspaceInvitation,
				...changes,
			}),
			changes: changes,
		};
	});

export const rejectWorkspaceInvitation = (params: {
	workspaceInvitation: WorkspaceInvitation;
	email: WorkspaceInvitation["email"];
	now: DateTime.Utc;
}): Result.Result<
	{
		entity: WorkspaceInvitation;
		changes: typeof WorkspaceInvitation.update.Type;
	},
	| WorkspaceInvitationNotPendingError
	| WorkspaceInvitationExpiredError
	| WorkspaceInvitationEmailMismatchError
> =>
	Result.gen(function* () {
		yield* ensurePending(params.workspaceInvitation);
		yield* ensureNotExpired(params.workspaceInvitation, params.now);
		yield* ensureEmailMatches(params.workspaceInvitation, params.email);

		const changes = { status: "rejected" as const };

		return {
			entity: WorkspaceInvitation.make({
				...params.workspaceInvitation,
				...changes,
			}),
			changes: changes,
		};
	});
