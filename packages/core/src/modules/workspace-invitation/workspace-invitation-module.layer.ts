import { DateTime, Effect, Layer, Option } from "effect";
import * as workspaceInvitationTransitions from "./domain/workspace-invitation.transitions";
import {
  WorkspaceInvitationModule,
  WorkspaceInvitationNotFoundError,
} from "./workspace-invitation-module.service";
import { WorkspaceInvitationRepository } from "./workspace-invitation-repository.service";

export const WorkspaceInvitationModuleLayer = Layer.effect(
  WorkspaceInvitationModule,
  Effect.gen(function* () {
    const workspaceInvitationRepo = yield* WorkspaceInvitationRepository;

    return {
      createOrRenewPendingWorkspaceInvitation: Effect.fn(
        "workspace-invitation.createOrRenewPendingWorkspaceInvitation"
      )(function* (params) {
        const now = yield* DateTime.now;

        const maybeActivePendingWorkspaceInvitation =
          yield* workspaceInvitationRepo.findActivePendingByEmail({
            workspaceId: params.workspaceId,
            email: params.data.email,
          });

        if (Option.isSome(maybeActivePendingWorkspaceInvitation)) {
          const { changes, entity } = yield* Effect.fromResult(
            workspaceInvitationTransitions.renewWorkspaceInvitation({
              workspaceInvitation: maybeActivePendingWorkspaceInvitation.value,
              now: now,
            })
          ).pipe(
            Effect.catch(() =>
              Effect.die(
                "invariant violated: findActivePendingByEmail returned a non-pending or expired invitation"
              )
            )
          );

          const persistedWorkspaceInvitation =
            yield* workspaceInvitationRepo.update({
              id: entity.id,
              workspaceId: entity.workspaceId,
              update: changes,
            });

          return persistedWorkspaceInvitation;
        }

        const workspaceInvitation = yield* Effect.fromResult(
          workspaceInvitationTransitions.createWorkspaceInvitation({
            data: params.data,
            inviterId: params.inviterId,
            workspaceId: params.workspaceId,
            now,
          })
        );

        const persistedWorkspaceInvitation =
          yield* workspaceInvitationRepo.insert(workspaceInvitation);

        return persistedWorkspaceInvitation;
      }),
      cancelWorkspaceInvitation: Effect.fn(
        "workspace-invitation.cancelWorkspaceInvitation"
      )(function* (params) {
        const now = yield* DateTime.now;

        const workspaceInvitation = yield* workspaceInvitationRepo
          .findById({
            workspaceId: params.workspaceId,
            id: params.id,
          })
          .pipe(
            Effect.flatMap(
              Option.match({
                onNone: () =>
                  Effect.fail(
                    new WorkspaceInvitationNotFoundError({
                      workspaceInvitationId: params.id,
                    })
                  ),
                onSome: Effect.succeed,
              })
            )
          );

        const { changes, entity } = yield* Effect.fromResult(
          workspaceInvitationTransitions.cancelWorkspaceInvitation({
            workspaceInvitation: workspaceInvitation,
            now: now,
          })
        );

        const persistedWorkspaceInvitation =
          yield* workspaceInvitationRepo.update({
            id: entity.id,
            workspaceId: entity.workspaceId,
            update: changes,
          });

        return persistedWorkspaceInvitation;
      }),
      acceptWorkspaceInvitation: Effect.fn(
        "workspace-invitation.acceptWorkspaceInvitation"
      )(function* (params) {
        const now = yield* DateTime.now;

        const workspaceInvitation = yield* workspaceInvitationRepo
          .findByInvitationId(params.id)
          .pipe(
            Effect.flatMap(
              Option.match({
                onNone: () =>
                  Effect.fail(
                    new WorkspaceInvitationNotFoundError({
                      workspaceInvitationId: params.id,
                    })
                  ),
                onSome: Effect.succeed,
              })
            )
          );

        const { changes, entity } = yield* Effect.fromResult(
          workspaceInvitationTransitions.acceptWorkspaceInvitation({
            workspaceInvitation: workspaceInvitation,
            email: params.email,
            now: now,
          })
        );

        const persistedWorkspaceInvitation =
          yield* workspaceInvitationRepo.update({
            id: entity.id,
            workspaceId: entity.workspaceId,
            update: changes,
          });

        return persistedWorkspaceInvitation;
      }),
      rejectWorkspaceInvitation: Effect.fn(
        "workspace-invitation.rejectWorkspaceInvitation"
      )(function* (params) {
        const now = yield* DateTime.now;

        const workspaceInvitation = yield* workspaceInvitationRepo
          .findByInvitationId(params.id)
          .pipe(
            Effect.flatMap(
              Option.match({
                onNone: () =>
                  Effect.fail(
                    new WorkspaceInvitationNotFoundError({
                      workspaceInvitationId: params.id,
                    })
                  ),
                onSome: Effect.succeed,
              })
            )
          );

        const { changes, entity } = yield* Effect.fromResult(
          workspaceInvitationTransitions.rejectWorkspaceInvitation({
            workspaceInvitation: workspaceInvitation,
            email: params.email,
            now: now,
          })
        );

        const persistedWorkspaceInvitation =
          yield* workspaceInvitationRepo.update({
            id: entity.id,
            workspaceId: entity.workspaceId,
            update: changes,
          });

        return persistedWorkspaceInvitation;
      }),
    };
  })
);
