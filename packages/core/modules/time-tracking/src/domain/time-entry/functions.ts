import {
  Domain,
  type ExistingMemberId,
  ExistingTimeEntryId,
  type ExistingWorkspaceId,
  generateUUID,
} from "@mason/framework";
import { type Effect, Option, type ParseResult, Schema } from "effect";
import { dual } from "effect/Function";
import { TimeEntry } from "./model";

// =============================================================================
// Constructors
// =============================================================================

/** Internal: validates and constructs a TimeEntry via Schema. */
const make = (
  input: TimeEntry
): Effect.Effect<TimeEntry, ParseResult.ParseError> =>
  Schema.decodeUnknown(TimeEntry)(input);

/** Default values for new time entries. */
const defaults = {
  taskId: Option.none(),
  notes: Option.none(),
  deletedAt: Option.none(),
} as const;

/**
 * Create a new time entry with generated ID.
 *
 * @category Constructors
 * @since 0.1.0
 */
export const create = (
  input: {
    projectId: TimeEntry["projectId"];
    startedAt: TimeEntry["startedAt"];
    stoppedAt: TimeEntry["stoppedAt"];
    taskId?: TimeEntry["taskId"];
    notes?: TimeEntry["notes"];
  },
  ids: {
    workspaceId: ExistingWorkspaceId;
    memberId: ExistingMemberId;
  }
): Effect.Effect<TimeEntry, ParseResult.ParseError> =>
  make({
    ...defaults,
    ...input,
    workspaceId: ids.workspaceId,
    memberId: ids.memberId,
    id: ExistingTimeEntryId.make(generateUUID()),
    _tag: "@mason/time-tracking/TimeEntry",
  });

// =============================================================================
// Predicates
// =============================================================================

/**
 * Check if time entry is deleted.
 *
 * @category Predicates
 * @since 0.1.0
 */
export const isDeleted = Domain.isDeleted;

// =============================================================================
// Transformations
// =============================================================================

interface PatchTimeEntry {
  projectId?: TimeEntry["projectId"];
  taskId?: TimeEntry["taskId"];
  startedAt?: TimeEntry["startedAt"];
  stoppedAt?: TimeEntry["stoppedAt"];
  notes?: TimeEntry["notes"];
}

/**
 * Update a time entry with patch data.
 *
 * @category Transformations
 * @since 0.1.0
 */
export const update = dual<
  (
    patch: PatchTimeEntry
  ) => (self: TimeEntry) => Effect.Effect<TimeEntry, ParseResult.ParseError>,
  (
    self: TimeEntry,
    patch: PatchTimeEntry
  ) => Effect.Effect<TimeEntry, ParseResult.ParseError>
>(2, (self, patch) =>
  make({
    ...self,
    ...patch,
    id: self.id,
  })
);

/**
 * Soft delete a time entry.
 *
 * @category Transformations
 * @since 0.1.0
 */
export const softDelete = Domain.makeSoftDelete(make);

/**
 * Restore a soft-deleted time entry.
 *
 * @category Transformations
 * @since 0.1.0
 */
export const restore = Domain.makeRestore(make);
