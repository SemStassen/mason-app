import { Schema } from "effect";
import { MemberId } from "~/domains/member";
import { ProjectId, TaskId } from "~/domains/project";
import { WorkspaceId } from "~/domains/workspace";
import { JsonRecord } from "~/shared/schemas";

export type TimeEntryId = typeof TimeEntryId.Type;
export const TimeEntryId = Schema.UUID.pipe(Schema.brand("TimeEntryId"));

/**
 * Time entry domain model.
 *
 * Represents a time entry tracking work on a project.
 *
 * @category Models
 * @since 0.1.0
 */
export type TimeEntry = typeof TimeEntry.Type;
export const TimeEntry = Schema.TaggedStruct("TimeEntry", {
  id: TimeEntryId,
  workspaceId: WorkspaceId,
  memberId: MemberId,
  projectId: ProjectId,
  taskId: Schema.OptionFromSelf(TaskId),
  startedAt: Schema.DateTimeUtcFromSelf,
  stoppedAt: Schema.DateTimeUtcFromSelf,
  notes: Schema.OptionFromSelf(JsonRecord),
  deletedAt: Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf),
}).pipe(
  Schema.Data,
  Schema.annotations({
    identifier: "TimeEntry",
    title: "Time Entry",
    description: "A time entry tracking work on a project",
  })
);
