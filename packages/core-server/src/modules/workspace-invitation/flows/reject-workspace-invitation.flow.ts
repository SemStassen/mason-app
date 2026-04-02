import type {
  RejectWorkspaceInvitationCommand,
  RejectWorkspaceInvitationResult,
} from "@recount/core/contracts";
import { WorkspaceInvitationModule } from "@recount/core/modules/workspace-invitation";
import { SessionContext } from "@recount/core/shared/auth";
import { Effect } from "effect";

export const rejectWorkspaceInvitationFlow = Effect.fn(
  "flows.rejectWorkspaceInvitationFlow"
)(function* (request: typeof RejectWorkspaceInvitationCommand.Type) {
  const { user } = yield* SessionContext;

  const workspaceInvitationModule = yield* WorkspaceInvitationModule;

  yield* workspaceInvitationModule.rejectWorkspaceInvitation({
    id: request.id,
    email: user.email,
  });

  return undefined satisfies typeof RejectWorkspaceInvitationResult.Type;
});
