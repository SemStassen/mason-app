import { Model, Schema } from "#shared/effect/index";
import { ProjectId, TaskId, WorkspaceId } from "#shared/schemas/index";

export class Task extends Model.Class<Task>("Task")(
  {
    id: Model.ClientGenerated(TaskId),
    workspaceId: Model.ServerImmutable(WorkspaceId),
    projectId: Model.ClientRequiredImmutable(ProjectId),
    name: Model.ClientMutable(
      Schema.NonEmptyTrimmedString.check(Schema.isMaxLength(255))
    ),
    archivedAt: Model.ServerManagedNullable(Schema.DateTimeUtcFromDate),
  },
  {
    identifier: "Task",
    title: "Task",
    description: "A task within a project",
  }
) {}
