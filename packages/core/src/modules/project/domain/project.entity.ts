import { Model, Schema } from "#shared/effect/index";
import { HexColor, ProjectId, WorkspaceId } from "#shared/schemas/index";

export class Project extends Model.Class<Project>("Project")(
  {
    id: Model.ServerImmutableClientImmutableCreateOptional(ProjectId),
    workspaceId: Model.ServerImmutable(WorkspaceId),
    name: Model.ServerMutableClientMutable(
      Schema.NonEmptyTrimmedString.check(Schema.isMaxLength(255))
    ),
    hexColor: Model.ServerMutableClientMutableCreateDefault(HexColor, {
      defaultValue: () => HexColor.makeUnsafe("#000000"),
    }),
    isBillable: Model.ServerMutableClientMutableCreateDefault(Schema.Boolean, {
      defaultValue: () => false,
    }),
    startDate: Model.ServerMutableClientMutableOptionalCreateDefault(
      Schema.DateTimeUtcFromDate,
      {
        defaultValue: () => null,
      }
    ),
    endDate: Model.ServerMutableClientMutableOptionalCreateDefault(
      Schema.DateTimeUtcFromDate,
      {
        defaultValue: () => null,
      }
    ),
    notes: Model.ServerMutableClientMutableOptionalCreateDefault(Schema.Json, {
      defaultValue: () => null,
    }),
    archivedAt: Model.ServerMutableOptional(Schema.DateTimeUtcFromDate),
  },
  {
    identifier: "Project",
    title: "Project",
    description: "A project within a workspace",
  }
) {}
