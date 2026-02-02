import { Effect, Option } from "effect";
import type { WorkspaceId, WorkspaceInvitationId } from "~/shared/schemas";
import { WorkspaceInvitationNotFoundError } from "../errors";
import { WorkspaceInvitationRepository } from "../repositories/workspace-invitation.repo";

export interface CancelWorkspaceInvitationInput {
  id: WorkspaceInvitationId;
  workspaceId: WorkspaceId;
}

export type CancelWorkspaceInvitationOutput = void;

export const CancelWorkspaceInvitationAction = Effect.fn(
  "invitation/CancelWorkspaceInvitationAction"
)(function* (input: CancelWorkspaceInvitationInput) {
  const workspaceInvitationRepo = yield* WorkspaceInvitationRepository;

  const workspaceInvitation = yield* workspaceInvitationRepo
    .retrieve({
      query: {
        workspaceId: input.workspaceId,
        id: input.id,
      },
    })
    .pipe(
      Effect.map(
        Option.getOrThrowWith(() => new WorkspaceInvitationNotFoundError())
      )
    );

  const acceptedWorkspaceInvitation =
    yield* workspaceInvitation.changeStatus("canceled");

  yield* workspaceInvitationRepo.update({
    workspaceId: input.workspaceId,
    workspaceInvitations: [acceptedWorkspaceInvitation],
  });
});
