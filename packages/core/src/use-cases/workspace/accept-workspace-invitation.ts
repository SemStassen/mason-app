import { Effect, Option, Schema } from "effect";
import { InvitationDomainService } from "~/domains/invitation/service";
import { MemberDomainService } from "~/domains/member/service";
import { AuthContext } from "~/infra/auth/middleware";
import { DatabaseService } from "~/infra/db";
import type { WorkspaceId, WorkspaceInvitationId } from "~/shared/schemas";

export class WorkspaceInvitationExpiredError extends Schema.TaggedError<WorkspaceInvitationExpiredError>()(
  "workspace-invitation/WorkspaceInvitationExpiredError",
  {}
) {}

export class WorkspaceInvitationNotFoundError extends Schema.TaggedError<WorkspaceInvitationNotFoundError>()(
  "workspace-invitation/WorkspaceInvitationNotFoundError",
  {}
) {}

export class WorkspaceInvitationNotForCurrentUserError extends Schema.TaggedError<WorkspaceInvitationNotForCurrentUserError>()(
  "workspace-invitation/WorkspaceInvitationNotForCurrentUserError",
  {}
) {}

export class WorkspaceInvitationEmailNotVerifiedError extends Schema.TaggedError<WorkspaceInvitationEmailNotVerifiedError>()(
  "workspace-invitation/WorkspaceInvitationEmailNotVerifiedError",
  {}
) {}

export const AcceptWorkspaceInvitationUseCase = (params: {
  workspaceId: WorkspaceId;
  workspaceInvitationId: WorkspaceInvitationId;
}) =>
  Effect.gen(function* () {
    const { currentUser } = yield* AuthContext;
    const db = yield* DatabaseService;
    const workspaceInvitationDomain = yield* InvitationDomainService;
    const memberDomain = yield* MemberDomainService;

    const maybeInvitation =
      yield* workspaceInvitationDomain.retrieveWorkspaceInvitation({
        workspaceId: params.workspaceId,
        query: { id: params.workspaceInvitationId },
      });

    const invitation = yield* Option.match(maybeInvitation, {
      onNone: () => Effect.fail(new WorkspaceInvitationNotFoundError()),
      onSome: (inv) => Effect.succeed(inv),
    });

    yield* Effect.filterOrFail(
      (inv) => inv.email === currentUser.email,
      () => new WorkspaceInvitationNotForCurrentUserError()
    );

    if (!currentUser.emailVerified) {
      return yield* Effect.fail(new WorkspaceInvitationEmailNotVerifiedError());
    }

    yield* workspaceInvitationDomain.acceptWorkspaceInvitation(invitation);
    const member = yield* memberDomain.makeMember({
      command: {
        workspaceId: params.workspaceId,
        userId: currentUser.id,
        role: invitation.role,
      },
    });

    yield* db.withTransaction(
      Effect.all([
        workspaceInvitationDomain.saveWorkspaceInvitations({
          workspaceId: params.workspaceId,
          existing: [invitation],
        }),
        memberDomain.saveMembers({
          workspaceId: params.workspaceId,
          existing: [member],
        }),
      ])
    );

    // TODO: Set active workspace for current user
  });
