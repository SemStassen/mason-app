import {
  ExistingProjectId,
  ExistingTaskId,
  ExistingTimeEntryId,
  ExistingWorkspaceId,
  generateUUID,
  JsonRecord,
  MemberId,
  ProjectId,
} from "@mason/framework";
import { DateTime, Effect, Schema } from "effect";
import { dual } from "effect/Function";
import type { ParseError } from "effect/ParseResult";

// =============================================================================
// Schema
// =============================================================================

const TimeEntryBaseFields = {
  id: ExistingTimeEntryId,
  // References
  workspaceId: ExistingWorkspaceId,
  memberId: MemberId,
  projectId: ExistingProjectId,
  taskId: Schema.NullOr(ExistingTaskId),
  // General
  startedAt: Schema.DateTimeUtcFromSelf,
  stoppedAt: Schema.DateTimeUtcFromSelf,
  notes: Schema.NullOr(JsonRecord),
  // Metadata
  deletedAt: Schema.NullOr(Schema.DateTimeUtcFromSelf),
};

const TimeEntryBase = Schema.TaggedStruct(
  "TimeEntry",
  TimeEntryBaseFields
).pipe(
  Schema.filter(({ startedAt, stoppedAt }) =>
    DateTime.greaterThan(stoppedAt, startedAt)
  )
);

export const TimeEntry = TimeEntryBase.pipe(
  Schema.Data,
  Schema.annotations({
    identifier: "TimeEntry",
    title: "Time Entry",
    description: "A time entry tracking work on a project",
  })
);

export type TimeEntry = Schema.Schema.Type<typeof TimeEntry>;

// =============================================================================
// Creation
// =============================================================================

export const CreateTimeEntry = Schema.Struct({
  workspaceId: TimeEntryBaseFields.workspaceId,
  memberId: TimeEntryBaseFields.memberId,
  projectId: ProjectId,
  taskId: Schema.optionalWith(TimeEntryBaseFields.taskId, {
    exact: true,
    default: () => null,
  }),
  startedAt: TimeEntryBaseFields.startedAt,
  stoppedAt: TimeEntryBaseFields.stoppedAt,
  notes: Schema.optionalWith(TimeEntryBaseFields.notes, {
    exact: true,
  }),
});

/**
 * Create a time entry from creation input.
 *
 * @since 0.1.0
 */
export const createTimeEntry = (
  input: typeof CreateTimeEntry.Type
): Effect.Effect<TimeEntry, ParseError> =>
  Schema.decodeUnknown(CreateTimeEntry)(input).pipe(
    Effect.flatMap((validated) =>
      Schema.decodeUnknown(TimeEntry)({
        ...validated,
        projectId: ExistingProjectId.make(validated.projectId),
        id: ExistingTimeEntryId.make(generateUUID()),
        deletedAt: null,
      })
    )
  );

// =============================================================================
// Updates
// =============================================================================

export const PatchTimeEntry = Schema.Struct({
  projectId: Schema.optionalWith(TimeEntryBaseFields.projectId, {
    exact: true,
  }),
  taskId: Schema.optionalWith(TimeEntryBaseFields.taskId, { exact: true }),
  startedAt: Schema.optionalWith(TimeEntryBaseFields.startedAt, {
    exact: true,
  }),
  stoppedAt: Schema.optionalWith(TimeEntryBaseFields.stoppedAt, {
    exact: true,
  }),
  notes: Schema.optionalWith(TimeEntryBaseFields.notes, { exact: true }),
});

/**
 * Update a time entry with patch data.
 *
 * @since 0.1.0
 */
export const updateTimeEntry = dual<
  (
    updates: typeof PatchTimeEntry.Type
  ) => (self: TimeEntry) => Effect.Effect<TimeEntry, ParseError>,
  (
    self: TimeEntry,
    updates: typeof PatchTimeEntry.Type
  ) => Effect.Effect<TimeEntry, ParseError>
>(2, (self, updates) =>
  Schema.decodeUnknown(PatchTimeEntry)(updates).pipe(
    Effect.flatMap((validated) => {
      return Schema.decodeUnknown(TimeEntry)({
        ...self,
        ...validated,
      });
    })
  )
);

// =============================================================================
// Soft Delete
// =============================================================================

/**
 * Soft delete a time entry by setting deletedAt.
 *
 * @since 0.1.0
 */
export const softDeleteTimeEntry = (
  self: TimeEntry
): Effect.Effect<TimeEntry> =>
  Effect.gen(function* () {
    if (self.deletedAt) {
      return self;
    }
    const deletedAt = yield* DateTime.now;
    return { ...self, deletedAt };
  });
