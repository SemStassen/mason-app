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
    id: Model.ClientGenerated(TimeEntryId),
    workspaceId: Model.ServerImmutable(WorkspaceId),
    workspaceMemberId: Model.ServerManaged(WorkspaceMemberId),
    projectId: Model.ClientMutable(ProjectId),
    taskId: Model.ClientMutableOptional(TaskId),
    startedAt: Model.ClientMutableWithDefault(Schema.DateTimeUtcFromDate),
    stoppedAt: Model.ClientMutableOptional(Schema.DateTimeUtcFromDate),
    notes: Model.ClientMutableOptional(Schema.Json),
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
