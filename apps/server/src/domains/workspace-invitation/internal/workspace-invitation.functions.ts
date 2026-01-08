import { DateTime, Duration, Effect, Schema } from "effect";
import { dual } from "effect/Function";
import {
  type MemberId,
  type WorkspaceId,
  WorkspaceInvitationId,
} from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";
import { WorkspaceInvitation } from "../schemas/workspace-invitation.model";
import { WorkspaceInvitationDomainError } from "./errors";

// Constructors
// =============================================================================

/** Internal: validates and constructs a WorkspaceInvitation via Schema. */
const _validate = (
  input: WorkspaceInvitation
): Effect.Effect<WorkspaceInvitation, WorkspaceInvitationDomainError> =>
  Effect.gen(function* () {
    return yield* Schema.validate(WorkspaceInvitation)(input);
  }).pipe(
    Effect.catchTags({
      ParseError: (e) =>
        Effect.fail(new WorkspaceInvitationDomainError({ cause: e })),
    })
  );

/** Default values for new workspace invitations. */
const makeDefaults = Effect.gen(function* () {
  const expiresAt = yield* DateTime.now.pipe(
    Effect.map((dt) => DateTime.addDuration(dt, Duration.days(30)))
  );

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
  input: {
    email: WorkspaceInvitation["email"];
    role: WorkspaceInvitation["role"];
  },
  system: {
    workspaceId: WorkspaceId;
    inviterId: MemberId;
  }
): Effect.Effect<WorkspaceInvitation, WorkspaceInvitationDomainError> =>
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
// Transformations
// =============================================================================

interface PatchWorkspaceInvitation {
  role?: WorkspaceInvitation["role"];
}

/**
 * Update a workspace invitation with patch data.
 *
 * @category Transformations
 * @since 0.1.0
 */
const updateWorkspaceInvitation = dual<
  (
    patch: PatchWorkspaceInvitation
  ) => (
    self: WorkspaceInvitation
  ) => Effect.Effect<WorkspaceInvitation, WorkspaceInvitationDomainError>,
  (
    self: WorkspaceInvitation,
    patch: PatchWorkspaceInvitation
  ) => Effect.Effect<WorkspaceInvitation, WorkspaceInvitationDomainError>
>(2, (self, patch) =>
  _validate({
    ...self,
    ...patch,
    id: self.id,
  })
);

const markWorkspaceInvitationAsAccepted = (self: WorkspaceInvitation) =>
  _validate({
    ...self,
    status: "accepted",
  });

const markWorkspaceInvitationAsRejected = (self: WorkspaceInvitation) =>
  _validate({
    ...self,
    status: "rejected",
  });

const markWorkspaceInvitationAsCanceled = (self: WorkspaceInvitation) =>
  _validate({
    ...self,
    status: "canceled",
  });

export const WorkspaceInvitationFns = {
  create: createWorkspaceInvitation,
  update: updateWorkspaceInvitation,
  markAsAccepted: markWorkspaceInvitationAsAccepted,
  markAsRejected: markWorkspaceInvitationAsRejected,
  markAsCanceled: markWorkspaceInvitationAsCanceled,
} as const;
