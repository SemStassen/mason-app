import type {
  AcceptWorkspaceInvitationCommand,
  AcceptWorkspaceInvitationResult,
} from "@mason/core/contracts";
import { IdentityModule } from "@mason/core/modules/identity";
import { WorkspaceInvitationModule } from "@mason/core/modules/workspace-invitation";
import { WorkspaceMemberModule } from "@mason/core/modules/workspace-member";
import { SessionContext } from "@mason/core/shared/auth";
import { Effect, Option } from "effect";

import { Database } from "#shared/database/index";

export const acceptWorkspaceInvitationFlow = Effect.fn(
  "flows.acceptWorkspaceInvitationFlow"
)(function* (request: typeof AcceptWorkspaceInvitationCommand.Type) {
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

  return undefined satisfies typeof AcceptWorkspaceInvitationResult.Type;
});
