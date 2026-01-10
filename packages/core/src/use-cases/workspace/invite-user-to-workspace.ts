import { Effect, Option, Schema } from "effect";
import { IdentityDomainService } from "~/domains/identity";
import { WorkspaceInvitationCommands } from "~/domains/invitation";
import { InvitationDomainService } from "~/domains/invitation/service";
import { MemberDomainService } from "~/domains/member/service";
import { AuthContext, CurrentMemberContext } from "~/infra/auth/middleware";
import { EmailService } from "~/infra/email";

export class WorkspaceMemberAlreadyExistsError extends Schema.TaggedError<WorkspaceMemberAlreadyExistsError>()(
  "workspace-invitation/WorkspaceMemberAlreadyExistsError",
  {}
) {}

export const InviteUserToWorkspaceCommand = WorkspaceInvitationCommands.Create;

// Todo: Maybe add transaction, with email check
export function inviteUserToWorkspaceUseCase(params: {
  command: typeof InviteUserToWorkspaceCommand.Type;
}) {
  return Effect.gen(function* () {
    const { currentUser } = yield* AuthContext;
    const { currentMember, currentWorkspace } = yield* CurrentMemberContext;

    const emailService = yield* EmailService;
    const identityDomain = yield* IdentityDomainService;
    const memberDomain = yield* MemberDomainService;
    const invitationDomain = yield* InvitationDomainService;

    // Check if there is already a member with this email
    yield* identityDomain
      .retrieveUser({
        query: {
          email: params.command.email,
        },
      })
      .pipe(
        Effect.flatMap(
          Option.match({
            onNone: () => Effect.void,
            onSome: (user) =>
              memberDomain
                .retrieveMember({
                  workspaceId: currentWorkspace.id,
                  query: {
                    userId: user.id,
                  },
                })
                .pipe(
                  Effect.option,
                  Effect.flatMap(
                    Option.match({
                      onNone: () => Effect.void,
                      onSome: () =>
                        Effect.fail(new WorkspaceMemberAlreadyExistsError()),
                    })
                  )
                ),
          })
        )
      );

    // Create or renew pending invitation
    const invitation = yield* invitationDomain
      .retrieveWorkspaceInvitation({
        workspaceId: currentWorkspace.id,
        query: {
          email: params.command.email,
          status: "pending",
          isNotExpired: true,
        },
      })
      .pipe(
        Effect.flatMap(
          Option.match({
            onNone: () =>
              invitationDomain.makeWorkspaceInvitation({
                workspaceId: currentWorkspace.id,
                inviterId: currentMember.id,
                command: params.command,
              }),
            onSome: invitationDomain.renewPendingWorkspaceInvitationExpiration,
          })
        )
      );

    yield* invitationDomain.saveWorkspaceInvitations({
      workspaceId: currentWorkspace.id,
      existing: [invitation],
    });

    yield* emailService.sendWorkspaceInvitation({
      email: params.command.email,
      workspace: {
        name: currentWorkspace.name,
        id: currentWorkspace.id,
      },
      inviterName: currentUser.displayName,
      invitationId: invitation.id,
    });
  });
}
