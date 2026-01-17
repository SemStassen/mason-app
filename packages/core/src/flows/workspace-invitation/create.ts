import { AuthorizationService } from "@mason/authorization";
import { Effect, Option } from "effect";
import { EmailService } from "~/infra/email";
import { IdentityActionsService } from "~/modules/identity";
import { InvitationActionsService } from "~/modules/invitation";
import { CreateWorkspaceInvitation } from "~/modules/invitation/domain";
import { MemberActionsService } from "~/modules/member";
import { SessionContext, WorkspaceContext } from "~/shared/auth";

export const CreateWorkspaceInvitationRequest = CreateWorkspaceInvitation.omit(
  "workspaceId",
  "inviterId"
);

export const CreateWorkspaceInvitationFlow = Effect.fn(
  "flows/CreateWorkspaceInvitationFlow"
)(function* (request: typeof CreateWorkspaceInvitationRequest.Type) {
  const { user } = yield* SessionContext;
  const { member, workspace } = yield* WorkspaceContext;

  const authz = yield* AuthorizationService;
  const email = yield* EmailService;

  const identityActions = yield* IdentityActionsService;
  const memberActions = yield* MemberActionsService;
  const invitationActions = yield* InvitationActionsService;

  yield* authz.ensureAllowed({
    action: "workspace:invite_user",
    role: member.role,
  });

  /** Assert that the user is not already a member of the workspace */
  yield* identityActions
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
            memberActions.assertUserNotWorkspaceMember({
              workspaceId: workspace.id,
              userId: user.id,
            }),
        })
      )
    );

  const invitation =
    yield* invitationActions.createOrRenewPendingWorkspaceInvitation({
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
