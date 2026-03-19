import type {
  CreateWorkspaceInvitationCommand,
  CreateWorkspaceInvitationResult,
} from "@mason/core/contracts";
import { IdentityModule } from "@mason/core/modules/identity";
import { WorkspaceInvitationModule } from "@mason/core/modules/workspace-invitation";
import { WorkspaceMemberModule } from "@mason/core/modules/workspace-member";
import { SessionContext, WorkspaceContext } from "@mason/core/shared/auth";
import { Mailer } from "@mason/core/shared/email";
import { Effect, Option } from "effect";
import { Authorization } from "#shared/authorization/index";

export const createWorkspaceInvitationFlow = Effect.fn(
  "flows.createWorkspaceInvitationFlow"
)(function* (request: typeof CreateWorkspaceInvitationCommand.Type) {
  const { user } = yield* SessionContext;
  const { member, workspace } = yield* WorkspaceContext;

  const authz = yield* Authorization;
  const mailer = yield* Mailer;

  const identityModule = yield* IdentityModule;
  const workspaceMemberModule = yield* WorkspaceMemberModule;
  const workspaceInvitationModule = yield* WorkspaceInvitationModule;

  yield* authz.ensureAllowed({
    action: "workspace:invite_user",
    role: member.role,
  });

  /** Assert that the user is not already a member of the workspace */
  yield* identityModule.retrieveUserByEmail(request.email).pipe(
    Effect.flatMap(
      Option.match({
        onNone: () => Effect.void,
        onSome: (user) =>
          workspaceMemberModule.assertUserNotWorkspaceMember({
            workspaceId: workspace.id,
            userId: user.id,
          }),
      })
    )
  );

  const createdWorkspaceInvitation =
    yield* workspaceInvitationModule.createOrRenewPendingWorkspaceInvitation({
      workspaceId: workspace.id,
      inviterId: member.id,
      data: request,
    });

  yield* mailer.sendWorkspaceInvitation({
    email: request.email,
    workspace: workspace,
    inviterName: user.displayName,
    invitationId: createdWorkspaceInvitation.id,
  });

  return createdWorkspaceInvitation satisfies typeof CreateWorkspaceInvitationResult.Type;
});
