import { Effect, Option } from "effect";
import type { WorkspaceInvitationId } from "~/shared/schemas";
import type { WorkspaceInvitation } from "../domain";
import { WorkspaceInvitationNotFoundError } from "../errors";
import { WorkspaceInvitationRepository } from "../repositories";

export interface RejectWorkspaceInvitationInput {
  id: WorkspaceInvitationId;
  email: WorkspaceInvitation["email"];
}

export type RejectWorkspaceInvitationOutput = void;

export const RejectWorkspaceInvitationAction = Effect.fn(
  "invitation/RejectWorkspaceInvitationAction"
)(function* (input: RejectWorkspaceInvitationInput) {
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

  const rejectedWorkspaceInvitation =
    yield* workspaceInvitation.changeStatus("rejected");

  yield* workspaceInvitationRepo.update({
    workspaceId: rejectedWorkspaceInvitation.workspaceId,
    workspaceInvitations: [rejectedWorkspaceInvitation],
  });
});
