import { Effect, Schema } from "effect";
import { InvitationActionsService } from "~/modules/invitation";
import { SessionContext } from "~/shared/auth";
import { WorkspaceInvitationId } from "~/shared/schemas";

export const RejectWorkspaceInvitationRequest = Schema.Struct({
  id: WorkspaceInvitationId,
});

export const RejectWorkspaceInvitationFlow = Effect.fn(
  "flows/RejectWorkspaceInvitationFlow"
)(function* (input: typeof RejectWorkspaceInvitationRequest.Type) {
  const { user } = yield* SessionContext;

  const invitationActions = yield* InvitationActionsService;

  yield* invitationActions.rejectWorkspaceInvitation({
    id: input.id,
    email: user.email,
  });
});
