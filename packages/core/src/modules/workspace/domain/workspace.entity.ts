import { Model, Schema } from "#shared/effect/index";
import { WorkspaceId } from "#shared/schemas/index";

export class Workspace extends Model.Class<Workspace>("Workspace")(
  {
    id: Model.ServerImmutable(WorkspaceId),
    name: Model.ClientMutable(
      Schema.NonEmptyTrimmedString.check(Schema.isMaxLength(100))
    ),
    slug: Model.ClientMutable(
      Schema.NonEmptyTrimmedString.check(Schema.isMaxLength(100))
    ),
    logoUrl: Model.ClientMutableOptional(Schema.NonEmptyTrimmedString),
  },
  {
    identifier: "Workspace",
    title: "Workspace",
    description: "A workspace",
  }
) {}
