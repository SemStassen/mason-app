import { Model, Schema } from "~/shared/effect";
import { WorkspaceId } from "~/shared/schemas";

export class Workspace extends Model.Class<Workspace>("Workspace")(
	{
		id: Model.ServerManaged(WorkspaceId),
		name: Model.Mutable(
			Schema.NonEmptyTrimmedString.check(Schema.isMaxLength(100)),
		),
		slug: Model.Mutable(
			Schema.NonEmptyTrimmedString.check(Schema.isMaxLength(100)),
		),
		logoUrl: Model.OptionalMutable(Schema.Option(Schema.NonEmptyTrimmedString)),
		metadata: Model.MutableOptional(Schema.Option(Schema.Json)),
	},
	{
		identifier: "Workspace",
		title: "Workspace",
		description: "A workspace",
	},
) {}
