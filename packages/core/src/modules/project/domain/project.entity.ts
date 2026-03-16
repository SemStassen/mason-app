import { Model, Schema } from "#shared/effect/index";
import { HexColor, ProjectId, WorkspaceId } from "#shared/schemas/index";

export class Project extends Model.Class<Project>("Project")(
  {
    id: Model.ClientGenerated(ProjectId),
    workspaceId: Model.ServerImmutable(WorkspaceId),
    name: Model.ClientMutable(
      Schema.NonEmptyTrimmedString.check(Schema.isMaxLength(255))
    ),
    hexColor: Model.ClientMutableWithDefault(HexColor),
    isBillable: Model.ClientMutableWithDefault(Schema.Boolean),
    startDate: Model.ClientMutableOptional(Schema.DateTimeUtcFromDate),
    endDate: Model.ClientMutableOptional(Schema.DateTimeUtcFromDate),
    notes: Model.ClientMutableOptional(Schema.Json),
    archivedAt: Model.ServerManagedNullable(Schema.DateTimeUtcFromDate),
  },
  {
    identifier: "Project",
    title: "Project",
    description: "A project within a workspace",
  }
) {}
