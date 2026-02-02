import { Effect, Schema } from "effect";
import { InvitationModuleService } from "~/modules/invitation";
import { SessionContext } from "~/shared/auth";
import { WorkspaceInvitationId } from "~/shared/schemas";

export const RejectWorkspaceInvitationRequest = Schema.Struct({
  id: WorkspaceInvitationId,
});

export const RejectWorkspaceInvitationFlow = Effect.fn(
  "flows/RejectWorkspaceInvitationFlow"
)(function* (input: typeof RejectWorkspaceInvitationRequest.Type) {
  const { user } = yield* SessionContext;

  const invitationModule = yield* InvitationModuleService;

  yield* invitationModule.rejectWorkspaceInvitation({
    id: input.id,
    email: user.email,
  });
});
