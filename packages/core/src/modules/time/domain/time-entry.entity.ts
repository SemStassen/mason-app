import { Option } from "effect";
import { Model, Schema } from "#shared/effect/index";
import {
  ProjectId,
  TaskId,
  TimeEntryId,
  WorkspaceId,
  WorkspaceMemberId,
} from "#shared/schemas/index";

export class TimeEntry extends Model.Class<TimeEntry>("TimeEntry")(
  {
    id: Model.ServerImmutableClientImmutableCreateOptional(TimeEntryId),
    workspaceId: Model.ServerImmutable(WorkspaceId),
    workspaceMemberId: Model.ServerImmutable(WorkspaceMemberId),
    projectId: Model.ServerMutableClientMutable(ProjectId),
    taskId: Model.ServerMutableClientMutableOptionalCreateDefault(TaskId, {
      defaultValue: () => null,
    }),
    startedAt: Model.Field({
      select: Schema.DateTimeUtcFromDate,
      insert: Schema.DateTimeUtcFromDate,
      update: Schema.optionalKey(Schema.DateTimeUtcFromDate),
      json: Schema.DateTimeUtcFromDate,
      jsonCreate: Schema.optionalKey(Schema.DateTimeUtcFromDate),
      jsonUpdate: Schema.optionalKey(Schema.DateTimeUtcFromDate),
    }),
    stoppedAt: Model.ServerMutableClientMutableOptionalCreateDefault(
      Schema.DateTimeUtcFromDate,
      {
        defaultValue: () => null,
      }
    ),
    notes: Model.ServerMutableClientMutableOptionalCreateDefault(Schema.Json, {
      defaultValue: () => null,
    }),
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
