import { Effect, Option, Schema } from "effect";
import { DatabaseService } from "~/infra/db";
import { IdentityModuleService } from "~/modules/identity/identity-module";
import { InvitationModuleService } from "~/modules/invitation/invitation-module.service";
import { MemberModuleService } from "~/modules/member/member-module.service";
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

  const invitationModule = yield* InvitationModuleService;
  const memberModule = yield* MemberModuleService;
  const identityModule = yield* IdentityModuleService;

  yield* db.withTransaction(
    Effect.gen(function* () {
      const invitation = yield* invitationModule.acceptWorkspaceInvitation({
        id: input.id,
        email: user.email,
      });

      yield* memberModule.createMember({
        workspaceId: invitation.workspaceId,
        userId: user.id,
        role: invitation.role,
      });

      yield* identityModule.setActiveWorkspace({
        sessionId: session.id,
        workspaceId: Option.some(invitation.workspaceId),
      });
    })
  );
});
