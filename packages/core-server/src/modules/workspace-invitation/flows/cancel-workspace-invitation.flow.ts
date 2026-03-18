import { Authorization } from "@mason/authorization";
import type {
  CancelWorkspaceInvitationCommand,
  CancelWorkspaceInvitationResult,
} from "@mason/core/contracts";
import { WorkspaceInvitationModule } from "@mason/core/modules/workspace-invitation";
import { WorkspaceContext } from "@mason/core/shared/auth";
import { Effect } from "effect";

export const cancelWorkspaceInvitationFlow = Effect.fn(
  "flows.cancelWorkspaceInvitationFlow"
)(function* (request: typeof CancelWorkspaceInvitationCommand.Type) {
  const { member, workspace } = yield* WorkspaceContext;

  const authz = yield* Authorization;

  const workspaceInvitationModule = yield* WorkspaceInvitationModule;

  yield* authz.ensureAllowed({
    action: "workspace:cancel_invite",
    role: member.role,
  });

  yield* workspaceInvitationModule.cancelWorkspaceInvitation({
    id: request.id,
    workspaceId: workspace.id,
  });

  return undefined satisfies typeof CancelWorkspaceInvitationResult.Type;
});
