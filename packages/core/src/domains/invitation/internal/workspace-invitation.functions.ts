import { DateTime, Duration, Effect, Schema } from "effect";
import {
  type MemberId,
  type WorkspaceId,
  WorkspaceInvitationId,
} from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";
import type { CreateWorkspaceInvitationCommand } from "../schemas";
import { WorkspaceInvitation } from "../schemas/workspace-invitation.model";
import { InvitationDomainError } from "./errors";

// =============================================================================
// Constants
// =============================================================================

const DefaultExpiration = DateTime.now.pipe(
  Effect.map((dt) => DateTime.addDuration(dt, Duration.days(30)))
);
// =============================================================================
// Constructors
// =============================================================================

/** Internal: validates and constructs a WorkspaceInvitation via Schema. */
const _validate = (
  input: WorkspaceInvitation
): Effect.Effect<WorkspaceInvitation, InvitationDomainError> =>
  Effect.gen(function* () {
    return yield* Schema.validate(WorkspaceInvitation)(input);
  }).pipe(
    Effect.catchTags({
      ParseError: (e) => Effect.fail(new InvitationDomainError({ cause: e })),
    })
  );

/** Default values for new workspace invitations. */
const makeDefaults = Effect.gen(function* () {
  const expiresAt = yield* DefaultExpiration;

  return {
    status: "pending",
    expiresAt,
  } as const;
});

/**
 * Create a new workspace invitation with generated ID.
 *
 * @category Constructors
 * @since 0.1.0
 */
const createWorkspaceInvitation = (
  input: CreateWorkspaceInvitationCommand,
  system: {
    workspaceId: WorkspaceId;
    inviterId: MemberId;
  }
): Effect.Effect<WorkspaceInvitation, InvitationDomainError> =>
  Effect.gen(function* () {
    const defaults = yield* makeDefaults;

    return yield* _validate({
      ...defaults,
      ...input,
      workspaceId: system.workspaceId,
      inviterId: system.inviterId,
      id: WorkspaceInvitationId.make(generateUUID()),
      _tag: "WorkspaceInvitation",
    });
  });

// =============================================================================
// Predicates
// =============================================================================

/**
 * Check if member is deleted.
 *
 * @category Predicates
 * @since 0.1.0
 */
const isWorkspaceInvitationExpired = (self: WorkspaceInvitation) =>
  DateTime.isPast(self.expiresAt);

// =============================================================================
// Transformations
// =============================================================================

const acceptWorkspaceInvitation = (self: WorkspaceInvitation) =>
  Effect.gen(function* () {
    const isExpired = yield* isWorkspaceInvitationExpired(self);

    if (isExpired) {
      return yield* Effect.fail(
        new InvitationDomainError({
          cause: "Workspace invitation is expired",
        })
      );
    }

    return yield* _validate({
      ...self,
      status: "accepted",
    });
  });

const renewPendingWorkspaceInvitationExpiration = (self: WorkspaceInvitation) =>
  Effect.gen(function* () {
    if (self.status !== "pending") {
      return yield* Effect.fail(
        new InvitationDomainError({
          cause: "Workspace invitation is not pending",
        })
      );
    }

    const isExpired = yield* isWorkspaceInvitationExpired(self);
    if (isExpired) {
      return yield* Effect.fail(
        new InvitationDomainError({
          cause: "Workspace invitation is already expired",
        })
      );
    }

    const expiresAt = yield* DefaultExpiration;

    return yield* _validate({
      ...self,
      expiresAt: expiresAt,
    });
  });

export const WorkspaceInvitationFns = {
  isExpired: isWorkspaceInvitationExpired,
  create: createWorkspaceInvitation,
  accept: acceptWorkspaceInvitation,
  renewPendingExpiration: renewPendingWorkspaceInvitationExpiration,
} as const;
