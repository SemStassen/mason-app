import { Model, Schema } from "#shared/effect/index";
import { HexColor, ProjectId, WorkspaceId } from "#shared/schemas/index";
export class Project extends Model.Class<Project>("Project")(
  {
    id: Model.ServerImmutable(ProjectId),
    workspaceId: Model.ServerImmutable(WorkspaceId),
    name: Model.Mutable(
      Schema.NonEmptyTrimmedString.check(Schema.isMaxLength(255))
    ),
    hexColor: Model.Field({
      select: HexColor,
      insert: HexColor,
      update: Schema.optionalKey(HexColor),
      json: HexColor,
      jsonCreate: Schema.optionalKey(HexColor),
      jsonUpdate: Schema.optionalKey(HexColor),
    }),
    isBillable: Model.Field({
      select: Schema.Boolean,
      insert: Schema.Boolean,
      update: Schema.optionalKey(Schema.Boolean),
      json: Schema.Boolean,
      jsonCreate: Schema.optionalKey(Schema.Boolean),
      jsonUpdate: Schema.optionalKey(Schema.Boolean),
    }),
    startDate: Model.MutableOptional(Schema.DateTimeUtcFromDate),
    endDate: Model.MutableOptional(Schema.DateTimeUtcFromDate),
    notes: Model.MutableOptional(Schema.Json),
    archivedAt: Model.ServerManaged(
      Schema.OptionFromNullOr(Schema.DateTimeUtcFromDate)
    ),
  },
  {
    identifier: "Project",
    title: "Project",
    description: "A project within a workspace",
  }
) {}
