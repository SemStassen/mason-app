import { DateTime, Duration, Effect, type ParseResult, Schema } from "effect";
import { dual } from "effect/Function";
import {
  type MemberId,
  type WorkspaceId,
  WorkspaceInvitationId,
} from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";
import { WorkspaceInvitation } from "../schemas/workspace-invitation.model";

// =============================================================================
// Constructors
// =============================================================================

/** Internal: validates and constructs a WorkspaceInvitation via Schema. */
const _make = (
  input: WorkspaceInvitation
): Effect.Effect<WorkspaceInvitation, ParseResult.ParseError> =>
  Schema.validate(WorkspaceInvitation)(input);

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
): Effect.Effect<WorkspaceInvitation, ParseResult.ParseError> =>
  Effect.gen(function* () {
    const defaults = yield* makeDefaults;

    return yield* _make({
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
  ) => Effect.Effect<WorkspaceInvitation, ParseResult.ParseError>,
  (
    self: WorkspaceInvitation,
    patch: PatchWorkspaceInvitation
  ) => Effect.Effect<WorkspaceInvitation, ParseResult.ParseError>
>(2, (self, patch) =>
  _make({
    ...self,
    ...patch,
    id: self.id,
  })
);

export const WorkspaceInvitationFns = {
  create: createWorkspaceInvitation,
  update: updateWorkspaceInvitation,
} as const;
