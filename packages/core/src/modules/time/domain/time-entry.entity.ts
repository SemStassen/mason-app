import { Option, Schema } from "effect";
import { Model } from "#shared/effect/index";
import {
  ProjectId,
  TaskId,
  TimeEntryId,
  WorkspaceId,
  WorkspaceMemberId,
} from "#shared/schemas/index";

export class TimeEntry extends Model.Class<TimeEntry>("TimeEntry")(
  {
    id: Model.ServerImmutable(TimeEntryId),
    workspaceId: Model.ServerImmutable(WorkspaceId),
    workspaceMemberId: Model.ServerManaged(WorkspaceMemberId),
    projectId: Model.Mutable(ProjectId),
    taskId: Model.MutableOptional(TaskId),
    startedAt: Model.Field({
      select: Schema.DateTimeUtcFromDate,
      insert: Schema.DateTimeUtcFromDate,
      update: Schema.optionalKey(Schema.DateTimeUtcFromDate),
      json: Schema.DateTimeUtcFromDate,
      jsonCreate: Schema.optionalKey(Schema.DateTimeUtcFromDate),
      jsonUpdate: Schema.optionalKey(Schema.DateTimeUtcFromDate),
    }),
    stoppedAt: Model.MutableOptional(Schema.DateTimeUtcFromDate),
    notes: Model.MutableOptional(Schema.Json),
  },
  {
    identifier: "TimeEntry",
    title: "Time Entry",
    description: "A time entry tracking work on a project",
  }
) {
  isRunning(): boolean {
    return Option.isNone(this.stoppedAt);
  }
}
