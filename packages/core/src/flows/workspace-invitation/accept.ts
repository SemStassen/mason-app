import { Effect, Option, Schema } from "effect";
import { DatabaseService } from "~/infra/db";
import { IdentityActionsService } from "~/modules/identity";
import { InvitationActionsService } from "~/modules/invitation";
import { MemberActionsService } from "~/modules/member";
import { SessionContext } from "~/shared/auth";
import { WorkspaceInvitationId } from "~/shared/schemas";

export const AcceptWorkspaceInvitationRequest = Schema.Struct({
  id: WorkspaceInvitationId,
});

export const AcceptWorkspaceInvitationFlow = Effect.fn(
  "flows/AcceptWorkspaceInvitationFlow"
)(function* (input: typeof AcceptWorkspaceInvitationRequest.Type) {
  const { user, session } = yield* SessionContext;

  const db = yield* DatabaseService;

  const invitationActions = yield* InvitationActionsService;
  const memberActions = yield* MemberActionsService;
  const identityActions = yield* IdentityActionsService;

  yield* db.withTransaction(
    Effect.gen(function* () {
      const invitation = yield* invitationActions.acceptWorkspaceInvitation({
        id: input.id,
        email: user.email,
      });

      yield* memberActions.createMember({
        workspaceId: invitation.workspaceId,
        userId: user.id,
        role: invitation.role,
      });

      yield* identityActions.setActiveWorkspace({
        sessionId: session.id,
        workspaceId: Option.some(invitation.workspaceId),
      });
    })
  );
});
