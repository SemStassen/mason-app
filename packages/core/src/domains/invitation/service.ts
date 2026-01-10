import { Array, Context, Effect, Layer, Option } from "effect";
import {
  type AuthorizationError,
  AuthorizationService,
} from "~/infra/authorization";
import type {
  Email,
  MemberId,
  WorkspaceId,
  WorkspaceInvitationId,
} from "~/shared/schemas";
import { mapNonEmptyArray } from "~/shared/utils/array";
import { InvitationDomainError, WorkspaceInvitationFns } from "./internal";
import { WorkspaceInvitationRepository } from "./repositories/workspace-invitation.repo";
import type { CreateWorkspaceInvitationCommand } from "./schemas/commands";
import type {
  WorkspaceInvitation,
  WorkspaceInvitationStatus,
} from "./schemas/workspace-invitation.model";

export class InvitationDomainService extends Context.Tag(
  "@mason/invitation/InvitationDomainService"
)<
  InvitationDomainService,
  {
    makeWorkspaceInvitation: (params: {
      workspaceId: WorkspaceId;
      inviterId: MemberId;
      command: CreateWorkspaceInvitationCommand;
    }) => Effect.Effect<WorkspaceInvitation, InvitationDomainError>;
    acceptWorkspaceInvitation: (
      existing: WorkspaceInvitation
    ) => Effect.Effect<WorkspaceInvitation, InvitationDomainError>;
    renewPendingWorkspaceInvitationExpiration: (
      existing: WorkspaceInvitation
    ) => Effect.Effect<WorkspaceInvitation, InvitationDomainError>;
    saveWorkspaceInvitations: (params: {
      workspaceId: WorkspaceId;
      existing: ReadonlyArray<WorkspaceInvitation>;
    }) => Effect.Effect<void, AuthorizationError | InvitationDomainError>;
    retrieveWorkspaceInvitation: (params: {
      workspaceId: WorkspaceId;
      query?: {
        id?: WorkspaceInvitationId;
        status?: WorkspaceInvitationStatus;
        email?: Email;
        isNotExpired?: boolean;
      };
    }) => Effect.Effect<
      Option.Option<WorkspaceInvitation>,
      AuthorizationError | InvitationDomainError
    >;
    listWorkspaceInvitations: (params: {
      workspaceId: WorkspaceId;
      query?: {
        ids?: ReadonlyArray<WorkspaceInvitationId>;
        status?: WorkspaceInvitationStatus;
      };
    }) => Effect.Effect<
      ReadonlyArray<WorkspaceInvitation>,
      AuthorizationError | InvitationDomainError
    >;
    hardDeleteWorkspaceInvitations: (params: {
      workspaceId: WorkspaceId;
      existing: ReadonlyArray<WorkspaceInvitation>;
    }) => Effect.Effect<void, AuthorizationError | InvitationDomainError>;
  }
>() {
  static readonly live = Layer.effect(
    InvitationDomainService,
    Effect.gen(function* () {
      const authorization = yield* AuthorizationService;
      const workspaceInvitationRepo = yield* WorkspaceInvitationRepository;

      return InvitationDomainService.of({
        makeWorkspaceInvitation: ({ workspaceId, inviterId, command }) =>
          WorkspaceInvitationFns.create(command, {
            workspaceId,
            inviterId,
          }),

        acceptWorkspaceInvitation: (existing) =>
          WorkspaceInvitationFns.accept(existing),

        renewPendingWorkspaceInvitationExpiration: (existing) =>
          WorkspaceInvitationFns.renewPendingExpiration(existing),

        saveWorkspaceInvitations: Effect.fn(
          "invitation/InvitationDomainService.saveWorkspaceInvitations"
        )(
          function* ({ workspaceId, existing }) {
            if (Array.isNonEmptyReadonlyArray(existing)) {
              yield* authorization.ensureWorkspaceMatches({
                workspaceId,
                model: existing,
              });

              yield* workspaceInvitationRepo.upsert({
                workspaceId,
                workspaceInvitations: existing,
              });
            }
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new InvitationDomainError({ cause: e })),
          })
        ),

        retrieveWorkspaceInvitation: Effect.fn(
          "invitation/InvitationDomainService.retrieveWorkspaceInvitation"
        )(
          function* (params) {
            const existing = yield* workspaceInvitationRepo.retrieve(params);

            if (Option.isSome(existing)) {
              yield* authorization.ensureWorkspaceMatches({
                workspaceId: params.workspaceId,
                model: [existing.value],
              });

              if (params.query?.isNotExpired) {
                const isExpired = yield* WorkspaceInvitationFns.isExpired(
                  existing.value
                );

                if (isExpired) {
                  return Option.none();
                }
              }
            }

            return existing;
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new InvitationDomainError({ cause: e })),
          })
        ),

        listWorkspaceInvitations: Effect.fn(
          "invitation/InvitationDomainService.listWorkspaceInvitations"
        )(
          function* ({ workspaceId, query }) {
            const existing = yield* workspaceInvitationRepo.list({
              workspaceId,
              query: { ...query },
            });

            yield* authorization.ensureWorkspaceMatches({
              workspaceId,
              model: existing,
            });

            return existing;
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new InvitationDomainError({ cause: e })),
          })
        ),

        hardDeleteWorkspaceInvitations: Effect.fn(
          "invitation/InvitationDomainService.hardDeleteWorkspaceInvitations"
        )(
          function* ({ workspaceId, existing }) {
            if (Array.isNonEmptyReadonlyArray(existing)) {
              yield* authorization.ensureWorkspaceMatches({
                workspaceId,
                model: existing,
              });

              const workspaceInvitationIds = mapNonEmptyArray(
                existing,
                (e) => e.id
              );

              yield* workspaceInvitationRepo.hardDelete({
                workspaceId,
                workspaceInvitationIds: workspaceInvitationIds,
              });
            }
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new InvitationDomainError({ cause: e })),
          })
        ),
      });
    })
  );
}
