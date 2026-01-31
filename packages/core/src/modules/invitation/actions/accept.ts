import { Effect, Option } from "effect";
import type { WorkspaceInvitationId } from "~/shared/schemas";
import {
  changeWorkspaceInvitationStatus,
  type WorkspaceInvitation,
} from "../domain";
import { WorkspaceInvitationNotFoundError } from "../errors";
import { WorkspaceInvitationRepository } from "../repositories";

export interface AcceptWorkspaceInvitationInput {
  id: WorkspaceInvitationId;
  email: WorkspaceInvitation["email"];
}

export type AcceptWorkspaceInvitationOutput = WorkspaceInvitation;

export const AcceptWorkspaceInvitationAction = Effect.fn(
  "invitation/AcceptWorkspaceInvitationAction"
)(function* (input: AcceptWorkspaceInvitationInput) {
  const workspaceInvitationRepo = yield* WorkspaceInvitationRepository;

  const workspaceInvitation = yield* workspaceInvitationRepo
    .retrieve({
      query: {
        id: input.id,
        // Ensure invitation belongs to user
        email: input.email,
      },
    })
    .pipe(
      Effect.map(
        Option.getOrThrowWith(() => new WorkspaceInvitationNotFoundError())
      )
    );

  const acceptedWorkspaceInvitation = yield* changeWorkspaceInvitationStatus(
    workspaceInvitation,
    "accepted"
  );

  const [updatedWorkspaceInvitation] = yield* workspaceInvitationRepo.update({
    workspaceId: acceptedWorkspaceInvitation.workspaceId,
    workspaceInvitations: [acceptedWorkspaceInvitation],
  });

  return updatedWorkspaceInvitation satisfies AcceptWorkspaceInvitationOutput;
});
