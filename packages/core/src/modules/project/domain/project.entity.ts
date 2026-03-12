import { Model, Schema } from "~/shared/effect";
import { HexColor, ProjectId, WorkspaceId } from "~/shared/schemas";
export class Project extends Model.Class<Project>("Project")(
	{
		id: Model.ServerManaged(ProjectId),
		workspaceId: Model.ServerManaged(WorkspaceId),
		name: Model.Mutable(
			Schema.NonEmptyTrimmedString.check(Schema.isMaxLength(255)),
		),
		hexColor: Model.MutableOptional(HexColor),
		isBillable: Model.MutableOptional(Schema.Boolean),
		startDate: Model.MutableOptional(Schema.DateTimeUtc),
		endDate: Model.MutableOptional(Schema.DateTimeUtc),
		notes: Model.MutableOptional(Schema.Json),
		archivedAt: Model.ServerManaged(
			Schema.OptionFromNullOr(Schema.DateTimeUtcFromDate),
		),
	},
	{
		identifier: "Project",
		title: "Project",
		description: "A project within a workspace",
	},
) {}
