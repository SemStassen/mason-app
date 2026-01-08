import { Effect, Schema } from "effect";
import type { UserDisplayName } from "~/domains/identity";
import type { MemberId } from "~/domains/member";
import type { WorkspaceId, WorkspaceName } from "~/domains/workspace";
import type { CreateWorkspaceInvitationCommand } from "~/domains/workspace-invitation";
import { EmailService } from "~/shared/email";

export class WorkspaceMemberAlreadyExistsError extends Schema.TaggedError<WorkspaceMemberAlreadyExistsError>()(
  "workspace-invitation/WorkspaceMemberAlreadyExistsError",
  {}
) {}

// Todo: Maybe add transaction, with email check
export function inviteUserToWorkspaceUseCase(params: {
  workspace: {
    id: WorkspaceId;
    name: WorkspaceName;
  };
  inviter: {
    id: MemberId;
    displayName: UserDisplayName;
  };
  command: CreateWorkspaceInvitationCommand;
}) {
  return Effect.gen(function* () {
    const emailService = yield* EmailService;
    const workspaceInvitationDomain = yield* WorkspaceInvitationDomainService;

    yield* workspaceInvitationDomain.createWorkspaceInvitation({
      workspaceId: params.workspace.id,
      inviterId: params.inviter.id,
      command: params.command,
    });

    yield* emailService.sendWorkspaceInvitation({
      email: params.command.email,
      workspaceName: params.workspace.name,
      inviterName: params.inviter.displayName,
    });
  });
}
