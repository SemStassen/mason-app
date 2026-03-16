import { Model, Schema } from "#shared/effect/index";
import { WorkspaceId } from "#shared/schemas/index";

export class Workspace extends Model.Class<Workspace>("Workspace")(
  {
    id: Model.ServerImmutable(WorkspaceId),
    name: Model.Mutable(
      Schema.NonEmptyTrimmedString.check(Schema.isMaxLength(100))
    ),
    slug: Model.Mutable(
      Schema.NonEmptyTrimmedString.check(Schema.isMaxLength(100))
    ),
    logoUrl: Model.MutableOptional(Schema.NonEmptyTrimmedString),
  },
  {
    identifier: "Workspace",
    title: "Workspace",
    description: "A workspace",
  }
) {}
