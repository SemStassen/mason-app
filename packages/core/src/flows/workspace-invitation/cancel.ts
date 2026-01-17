import { AuthorizationService } from "@mason/authorization";
import { Effect, Schema } from "effect";
import { InvitationActionsService } from "~/modules/invitation";
import { WorkspaceContext } from "~/shared/auth";
import { WorkspaceInvitationId } from "~/shared/schemas";

export const CancelWorkspaceInvitationRequest = Schema.Struct({
  id: WorkspaceInvitationId,
});

export const CancelWorkspaceInvitationFlow = Effect.fn(
  "flows/CancelWorkspaceInvitationFlow"
)(function* (input: typeof CancelWorkspaceInvitationRequest.Type) {
  const { member, workspace } = yield* WorkspaceContext;

  const authz = yield* AuthorizationService;

  const invitationActions = yield* InvitationActionsService;

  yield* authz.ensureAllowed({
    action: "workspace:cancel_invite",
    role: member.role,
  });

  yield* invitationActions.cancelWorkspaceInvitation({
    id: input.id,
    workspaceId: workspace.id,
  });
});
