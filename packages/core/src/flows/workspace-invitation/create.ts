import { AuthorizationService } from "@mason/authorization";
import { Effect, Option } from "effect";
import { EmailService } from "~/infra/email";
import { IdentityModuleService } from "~/modules/identity/identity-module";
import { WorkspaceInvitation } from "~/modules/invitation/domain/workspace-invitation.model";
import { InvitationModuleService } from "~/modules/invitation/invitation-module.service";
import { MemberModuleService } from "~/modules/member/member-module.service";
import { SessionContext, WorkspaceContext } from "~/shared/auth";

export const CreateWorkspaceInvitationRequest = WorkspaceInvitation.createInput;

export const CreateWorkspaceInvitationFlow = Effect.fn(
  "flows/CreateWorkspaceInvitationFlow"
)(function* (request: typeof CreateWorkspaceInvitationRequest.Type) {
  const { user } = yield* SessionContext;
  const { member, workspace } = yield* WorkspaceContext;

  const authz = yield* AuthorizationService;
  const email = yield* EmailService;

  const identityModule = yield* IdentityModuleService;
  const memberModule = yield* MemberModuleService;
  const invitationModule = yield* InvitationModuleService;

  yield* authz.ensureAllowed({
    action: "workspace:invite_user",
    role: member.role,
  });

  /** Assert that the user is not already a member of the workspace */
  yield* identityModule
    .retrieveUser({
      query: {
        email: request.email,
      },
    })
    .pipe(
      Effect.flatMap(
        Option.match({
          onNone: () => Effect.void,
          onSome: (user) =>
            memberModule.assertUserNotWorkspaceMember({
              workspaceId: workspace.id,
              userId: user.id,
            }),
        })
      )
    );

  const invitation =
    yield* invitationModule.createOrRenewPendingWorkspaceInvitation({
      ...request,
      workspaceId: workspace.id,
      inviterId: member.id,
    });

  yield* email.sendWorkspaceInvitation({
    email: request.email,
    workspace: workspace,
    inviterName: user.displayName,
    invitationId: invitation.id,
  });
});
