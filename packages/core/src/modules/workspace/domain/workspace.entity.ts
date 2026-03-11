import { Option } from "effect";
import { Model, Schema } from "~/shared/effect";
import { WorkspaceId } from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";

export class Workspace extends Model.Class<Workspace>("Workspace")(
	{
		id: Model.ServerManaged(WorkspaceId),
		name: Model.Mutable(
			Schema.NonEmptyTrimmedString.check(Schema.isMaxLength(100)),
		),
		slug: Model.Mutable(
			Schema.NonEmptyTrimmedString.check(Schema.isMaxLength(100)),
		),
		logoUrl: Model.MutableOptional(Schema.NonEmptyTrimmedString),
		metadata: Model.MutableOptional(Schema.Json),
	},
	{
		identifier: "Workspace",
		title: "Workspace",
		description: "A workspace",
	},
) {
	static create(params: {
		name: Workspace["name"];
		slug: Workspace["slug"];
		logoUrl?: Workspace["logoUrl"];
		metadata?: Workspace["metadata"];
	}): Workspace {
		return Workspace.make({
			...params,
			id: WorkspaceId.makeUnsafe(generateUUID()),
			logoUrl: params.logoUrl ?? Option.none(),
			metadata: params.metadata ?? Option.none(),
		});
	}
}
