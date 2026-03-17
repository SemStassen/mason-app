import { Effect, Option, Schema } from "effect";
import { IdentityModule } from "#modules/identity/index";
import {
  WorkspaceInvitation,
  WorkspaceInvitationModule,
} from "#modules/workspace-invitation/index";
import { WorkspaceMemberModule } from "#modules/workspace-member/index";
import { SessionContext } from "#shared/auth/index";
import { Database } from "#shared/database/index";

export const AcceptWorkspaceInvitationRequest = Schema.Struct({
  id: WorkspaceInvitation.fields.id,
});

export const AcceptWorkspaceInvitationResponse = Schema.Void;

export const acceptWorkspaceInvitationFlow = Effect.fn(
  "flows.acceptWorkspaceInvitationFlow"
)(function* (request: typeof AcceptWorkspaceInvitationRequest.Type) {
  const { user, session } = yield* SessionContext;

  const db = yield* Database;

  const workspaceInvitationModule = yield* WorkspaceInvitationModule;
  const workspaceMemberModule = yield* WorkspaceMemberModule;
  const identityModule = yield* IdentityModule;

  yield* db.withTransaction(
    Effect.gen(function* () {
      const invitation =
        yield* workspaceInvitationModule.acceptWorkspaceInvitation({
          id: request.id,
          email: user.email,
        });

      yield* workspaceMemberModule.createWorkspaceMember({
        workspaceId: invitation.workspaceId,
        userId: user.id,
        role: invitation.role,
      });

      yield* identityModule
        .setActiveWorkspace({
          sessionId: session.id,
          workspaceId: Option.some(invitation.workspaceId),
        })
        .pipe(
          Effect.catchTag("identity/SessionNotFoundError", () =>
            Effect.die(
              "invariant violated: session disappeared mid-transaction"
            )
          )
        );
    })
  );

  return undefined satisfies typeof AcceptWorkspaceInvitationResponse.Type;
});
