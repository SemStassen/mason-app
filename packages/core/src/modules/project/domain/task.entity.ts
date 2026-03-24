import { Schema } from "effect";

import { Model } from "#internal/effect/index";
import {
  NonEmptyTrimmedString,
  ProjectId,
  TaskId,
  WorkspaceId,
} from "#shared/schemas/index";

export class Task extends Model.Class<Task>("Task")(
  {
    id: Model.ServerImmutableClientImmutableCreateOptional(TaskId),
    workspaceId: Model.ServerImmutable(WorkspaceId),
    projectId: Model.ServerMutableClientImmutable(ProjectId),
    name: Model.ServerMutableClientMutable(
      NonEmptyTrimmedString.check(Schema.isMaxLength(255))
    ),
    archivedAt: Model.ServerMutableOptional(Schema.DateTimeUtcFromDate),
  },
  {
    identifier: "Task",
    title: "Task",
    description: "A task within a project",
  }
) {}
