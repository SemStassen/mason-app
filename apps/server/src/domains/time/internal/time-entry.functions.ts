import { type Effect, Option, type ParseResult, Schema } from "effect";
import { dual } from "effect/Function";
import { TimeEntryId, type WorkspaceId } from "~/shared/schemas";
import {
  generateUUID,
  isDeleted,
  makeRestore,
  makeSoftDelete,
} from "~/shared/utils";
import { TimeEntry } from "../schemas/time-entry.model";

// =============================================================================
// Constructors
// =============================================================================

/** Internal: validates and constructs a TimeEntry via Schema. */
const _make = (
  input: TimeEntry
): Effect.Effect<TimeEntry, ParseResult.ParseError> =>
  Schema.validate(TimeEntry)(input);

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
const createTimeEntry = (
  input: {
    projectId: TimeEntry["projectId"];
    memberId: TimeEntry["memberId"];
    startedAt: TimeEntry["startedAt"];
    stoppedAt: TimeEntry["stoppedAt"];
    taskId?: TimeEntry["taskId"];
    notes?: TimeEntry["notes"];
  },
  system: {
    workspaceId: WorkspaceId;
  }
): Effect.Effect<TimeEntry, ParseResult.ParseError> =>
  _make({
    ...defaults,
    ...input,
    workspaceId: system.workspaceId,
    id: TimeEntryId.make(generateUUID()),
    _tag: "TimeEntry",
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
const isTimeEntryDeleted = isDeleted;

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
const updateTimeEntry = dual<
  (
    patch: PatchTimeEntry
  ) => (self: TimeEntry) => Effect.Effect<TimeEntry, ParseResult.ParseError>,
  (
    self: TimeEntry,
    patch: PatchTimeEntry
  ) => Effect.Effect<TimeEntry, ParseResult.ParseError>
>(2, (self, patch) =>
  _make({
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
const softDeleteTimeEntry = makeSoftDelete(_make);

/**
 * Restore a soft-deleted time entry.
 *
 * @category Transformations
 * @since 0.1.0
 */
const restoreTimeEntry = makeRestore(_make);

export const TimeEntryFns = {
  create: createTimeEntry,
  update: updateTimeEntry,
  softDelete: softDeleteTimeEntry,
  restore: restoreTimeEntry,
  isDeleted: isTimeEntryDeleted,
} as const;
