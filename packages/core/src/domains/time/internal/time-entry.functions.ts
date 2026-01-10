import { DateTime, Effect, Option, Schema } from "effect";
import { dual } from "effect/Function";
import { TimeEntryId, type WorkspaceId } from "~/shared/schemas";
import {
  generateUUID,
  isDeleted,
  makeRestore,
  makeSoftDelete,
} from "~/shared/utils";
import type { CreateTimeEntryCommand, PatchTimeEntryCommand } from "../schemas";
import { TimeEntry } from "../schemas/time-entry.model";
import { TimeDomainError } from "./errors";

// =============================================================================
// Helpers
// =============================================================================

const _validateDates = (
  input: TimeEntry
): Effect.Effect<TimeEntry, TimeDomainError> =>
  Effect.gen(function* () {
    if (DateTime.lessThan(input.stoppedAt, input.startedAt)) {
      return yield* Effect.fail(
        new TimeDomainError({
          cause: "Stopped at must be after started at",
        })
      );
    }

    return input;
  });

// =============================================================================
// Constructors
// =============================================================================

/** Internal: validates and constructs a TimeEntry via Schema. */
const _validate = (
  input: TimeEntry
): Effect.Effect<TimeEntry, TimeDomainError> =>
  Effect.gen(function* () {
    const validated = yield* Schema.validate(TimeEntry)(input);

    return yield* _validateDates(validated);
  }).pipe(
    Effect.catchTags({
      ParseError: (e) => Effect.fail(new TimeDomainError({ cause: e })),
    })
  );

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
  input: CreateTimeEntryCommand,
  system: {
    workspaceId: WorkspaceId;
  }
): Effect.Effect<TimeEntry, TimeDomainError> =>
  _validate({
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

/**
 * Patch a time entry with patch data.
 *
 * @category Transformations
 * @since 0.1.0
 */
const patchTimeEntry = dual<
  (
    patch: PatchTimeEntryCommand
  ) => (self: TimeEntry) => Effect.Effect<TimeEntry, TimeDomainError>,
  (
    self: TimeEntry,
    patch: PatchTimeEntryCommand
  ) => Effect.Effect<TimeEntry, TimeDomainError>
>(2, (self, patch) =>
  _validate({
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
const softDeleteTimeEntry = makeSoftDelete(_validate);

/**
 * Restore a soft-deleted time entry.
 *
 * @category Transformations
 * @since 0.1.0
 */
const restoreTimeEntry = makeRestore(_validate);

export const TimeEntryFns = {
  create: createTimeEntry,
  patch: patchTimeEntry,
  softDelete: softDeleteTimeEntry,
  restore: restoreTimeEntry,
  isDeleted: isTimeEntryDeleted,
} as const;
