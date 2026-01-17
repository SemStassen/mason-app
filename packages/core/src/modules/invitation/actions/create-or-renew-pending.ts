import { Effect, Option } from "effect";
import type { MemberId, WorkspaceId } from "~/shared/schemas";
import { WorkspaceInvitation } from "../domain";
import { WorkspaceInvitationRepository } from "../repositories";

export interface CreateOrRenewPendingWorkspaceInvitationInput {
  workspaceId: WorkspaceId;
  inviterId: MemberId;
  email: WorkspaceInvitation["email"];
  role: WorkspaceInvitation["role"];
}

export type CreateOrRenewPendingWorkspaceInvitationOutput = WorkspaceInvitation;

export const CreateOrRenewPendingWorkspaceInvitationAction = Effect.fn(
  "invitation/CreateOrRenewPendingWorkspaceInvitationAction"
)(function* (input: CreateOrRenewPendingWorkspaceInvitationInput) {
  const workspaceInvitationRepo = yield* WorkspaceInvitationRepository;

  const createdOrRenewedInvitation = yield* workspaceInvitationRepo
    .retrieve({
      query: {
        workspaceId: input.workspaceId,
        status: "pending",
        email: input.email,
      },
    })
    .pipe(
      Effect.flatMap(
        Option.match({
          onNone: () => WorkspaceInvitation.create(input),
          onSome: (invitation) => invitation.renew(),
        })
      )
    );

  const [upsertedInvitation] = yield* workspaceInvitationRepo.upsert({
    workspaceId: input.workspaceId,
    workspaceInvitations: [createdOrRenewedInvitation],
  });

  return upsertedInvitation;
});
