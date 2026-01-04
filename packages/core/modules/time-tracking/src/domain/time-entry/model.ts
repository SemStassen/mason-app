import {
  ExistingMemberId,
  ExistingProjectId,
  ExistingTaskId,
  ExistingTimeEntryId,
  ExistingWorkspaceId,
  JsonRecord,
} from "@mason/framework";
import { DateTime, Schema } from "effect";

// =============================================================================
// Schema
// =============================================================================

/**
 * Time entry field definitions.
 *
 * Used to construct the TimeEntry domain model and derive DTOs.
 * Access individual fields via `TimeEntryFields.fields.fieldName`.
 *
 * @category Schema
 * @since 0.1.0
 */
export const TimeEntryFields = Schema.TaggedStruct(
  "@mason/time-tracking/TimeEntry",
  {
    id: ExistingTimeEntryId,
    workspaceId: ExistingWorkspaceId,
    memberId: ExistingMemberId,
    projectId: ExistingProjectId,
    taskId: Schema.OptionFromSelf(ExistingTaskId),
    startedAt: Schema.DateTimeUtcFromSelf,
    stoppedAt: Schema.DateTimeUtcFromSelf,
    notes: Schema.OptionFromSelf(JsonRecord),
    deletedAt: Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf),
  }
);

/**
 * Time entry domain model.
 *
 * Represents a time entry tracking work on a project.
 *
 * @category Models
 * @since 0.1.0
 */
export type TimeEntry = typeof TimeEntry.Type;
export const TimeEntry = TimeEntryFields.pipe(
  Schema.Data,
  Schema.filter((input) => {
    const startedAt = input.startedAt;
    const stoppedAt = input.stoppedAt;
    return DateTime.greaterThan(stoppedAt, startedAt);
  }, {}),
  Schema.annotations({
    identifier: "TimeEntry",
    title: "Time Entry",
    description: "A time entry tracking work on a project",
  })
);
