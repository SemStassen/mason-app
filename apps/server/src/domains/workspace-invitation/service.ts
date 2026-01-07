import { Context, Effect, Layer, Option } from "effect";
import { AuthorizationService } from "~/application/authorization";
import type { AuthorizationError } from "~/shared/errors/authorization";
import type {
  MemberId,
  WorkspaceId,
  WorkspaceInvitationId,
} from "~/shared/schemas";
import { processArray } from "~/shared/utils";
import {
  WorkspaceInvitationDomainError,
  WorkspaceInvitationFns,
  WorkspaceInvitationNotFoundError,
} from "./internal";
import { WorkspaceInvitationRepository } from "./repositories/workspace-invitation.repo";
import type {
  CreateWorkspaceInvitationCommand,
  UpdateWorkspaceInvitationCommand,
} from "./schemas/commands";
import type {
  WorkspaceInvitation,
  WorkspaceInvitationStatus,
} from "./schemas/workspace-invitation.model";

export class WorkspaceInvitationDomainService extends Context.Tag(
  "@mason/workspace-invitation/WorkspaceInvitationDomainService"
)<
  WorkspaceInvitationDomainService,
  {
    createWorkspaceInvitation: (params: {
      workspaceId: WorkspaceId;
      inviterId: MemberId;
      command: CreateWorkspaceInvitationCommand;
    }) => Effect.Effect<WorkspaceInvitation, WorkspaceInvitationDomainError>;
    updateWorkspaceInvitation: (params: {
      workspaceId: WorkspaceId;
      command: UpdateWorkspaceInvitationCommand;
    }) => Effect.Effect<
      WorkspaceInvitation,
      | AuthorizationError
      | WorkspaceInvitationDomainError
      | WorkspaceInvitationNotFoundError
    >;
    hardDeleteWorkspaceInvitations: (params: {
      workspaceId: WorkspaceId;
      workspaceInvitationIds: ReadonlyArray<WorkspaceInvitationId>;
    }) => Effect.Effect<
      void,
      | AuthorizationError
      | WorkspaceInvitationDomainError
      | WorkspaceInvitationNotFoundError
    >;
    markWorkspaceInvitationAsAccepted: (params: {
      workspaceId: WorkspaceId;
      workspaceInvitationId: WorkspaceInvitationId;
    }) => Effect.Effect<
      void,
      | AuthorizationError
      | WorkspaceInvitationDomainError
      | WorkspaceInvitationNotFoundError
    >;
    retrieveWorkspaceInvitation: (params: {
      workspaceId: WorkspaceId;
      workspaceInvitationId: WorkspaceInvitationId;
    }) => Effect.Effect<
      Option.Option<WorkspaceInvitation>,
      WorkspaceInvitationDomainError
    >;
    listWorkspaceInvitations: (params: {
      workspaceId: WorkspaceId;
      query?: {
        ids?: ReadonlyArray<WorkspaceInvitationId>;
        status?: WorkspaceInvitationStatus;
      };
    }) => Effect.Effect<
      ReadonlyArray<WorkspaceInvitation>,
      WorkspaceInvitationDomainError
    >;
  }
>() {
  static readonly live = Layer.effect(
    WorkspaceInvitationDomainService,
    Effect.gen(function* () {
      const authorization = yield* AuthorizationService;
      const workspaceInvitationRepo = yield* WorkspaceInvitationRepository;

      return WorkspaceInvitationDomainService.of({
        createWorkspaceInvitation: Effect.fn(
          "workspace-invitation/WorkspaceInvitationDomainService.createWorkspaceInvitation"
        )(({ workspaceId, inviterId, command }) =>
          Effect.gen(function* () {
            const created = yield* WorkspaceInvitationFns.create(command, {
              workspaceId,
              inviterId,
            });

            const [inserted] = yield* workspaceInvitationRepo.insert({
              workspaceInvitations: [created],
            });

            return inserted;
          }).pipe(
            Effect.catchTags({
              "shared/DatabaseError": (e) =>
                Effect.fail(new WorkspaceInvitationDomainError({ cause: e })),
            })
          )
        ),
        updateWorkspaceInvitation: Effect.fn(
          "workspace-invitation/WorkspaceInvitationDomainService.updateWorkspaceInvitation"
        )(({ workspaceId, command }) =>
          Effect.gen(function* () {
            const existing = yield* workspaceInvitationRepo
              .retrieve({
                workspaceId,
                workspaceInvitationId: command.workspaceInvitationId,
              })
              .pipe(
                Effect.flatMap(
                  Option.match({
                    onNone: () =>
                      Effect.fail(new WorkspaceInvitationNotFoundError()),
                    onSome: Effect.succeed,
                  })
                )
              );

            yield* authorization.ensureWorkspaceMatches({
              workspaceId,
              model: [existing],
            });

            const updated = yield* WorkspaceInvitationFns.update(
              existing,
              command
            );

            const [result] = yield* workspaceInvitationRepo.update({
              workspaceId,
              workspaceInvitations: [updated],
            });

            return result;
          }).pipe(
            Effect.catchTags({
              "shared/DatabaseError": (e) =>
                Effect.fail(new WorkspaceInvitationDomainError({ cause: e })),
            })
          )
        ),
        hardDeleteWorkspaceInvitations: Effect.fn(
          "workspace-invitation/WorkspaceInvitationDomainService.hardDeleteWorkspaceInvitations"
        )(({ workspaceId, workspaceInvitationIds }) =>
          processArray({
            items: workspaceInvitationIds,
            onEmpty: Effect.void,
            prepare: (ids) =>
              Effect.gen(function* () {
                const existingInvitations = yield* workspaceInvitationRepo.list(
                  {
                    workspaceId,
                    query: { ids },
                  }
                );

                yield* authorization.ensureWorkspaceMatches({
                  workspaceId,
                  model: existingInvitations,
                });

                return new Map(existingInvitations.map((e) => [e.id, e]));
              }),
            mapItem: (invitationId, existingMap) =>
              Effect.gen(function* () {
                const existing = existingMap.get(invitationId);

                if (!existing) {
                  return yield* Effect.fail(
                    new WorkspaceInvitationNotFoundError()
                  );
                }

                return existing.id;
              }),
            execute: (invitationIdsToDelete) =>
              workspaceInvitationRepo.hardDelete({
                workspaceId,
                workspaceInvitationIds: invitationIdsToDelete,
              }),
          }).pipe(
            Effect.catchTags({
              "shared/DatabaseError": (e) =>
                Effect.fail(new WorkspaceInvitationDomainError({ cause: e })),
            })
          )
        ),
        markWorkspaceInvitationAsAccepted: Effect.fn(
          "workspace-invitation/WorkspaceInvitationDomainService.markWorkspaceInvitationAsAccepted"
        )(({ workspaceId, workspaceInvitationId }) =>
          Effect.gen(function* () {
            const existing = yield* workspaceInvitationRepo
              .retrieve({
                workspaceId,
                workspaceInvitationId,
              })
              .pipe(
                Effect.flatMap(
                  Option.match({
                    onNone: () =>
                      Effect.fail(new WorkspaceInvitationNotFoundError()),
                    onSome: Effect.succeed,
                  })
                )
              );

            yield* authorization.ensureWorkspaceMatches({
              workspaceId,
              model: [existing],
            });

            const updated =
              yield* WorkspaceInvitationFns.markAsAccepted(existing);

            const [result] = yield* workspaceInvitationRepo.update({
              workspaceId,
              workspaceInvitations: [updated],
            });

            return result;
          }).pipe(
            Effect.catchTags({
              "shared/DatabaseError": (e) =>
                Effect.fail(new WorkspaceInvitationDomainError({ cause: e })),
            })
          )
        ),
        retrieveWorkspaceInvitation: Effect.fn(
          "workspace-invitation/WorkspaceInvitationDomainService.retrieveWorkspaceInvitation"
        )(({ workspaceId, workspaceInvitationId }) =>
          workspaceInvitationRepo
            .retrieve({ workspaceId, workspaceInvitationId })
            .pipe(
              Effect.catchTags({
                "shared/DatabaseError": (e) =>
                  Effect.fail(new WorkspaceInvitationDomainError({ cause: e })),
              })
            )
        ),
        listWorkspaceInvitations: Effect.fn(
          "workspace-invitation/WorkspaceInvitationDomainService.listWorkspaceInvitations"
        )(({ workspaceId, query }) =>
          workspaceInvitationRepo
            .list({
              workspaceId,
              query: { ...query },
            })
            .pipe(
              Effect.catchTags({
                "shared/DatabaseError": (e) =>
                  Effect.fail(new WorkspaceInvitationDomainError({ cause: e })),
              })
            )
        ),
      });
    })
  );
}
