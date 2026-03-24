import { Schema } from "effect";

import { Model } from "#internal/effect/index";
import { NonEmptyTrimmedString, WorkspaceId } from "#shared/schemas/index";

export class Workspace extends Model.Class<Workspace>("Workspace")(
  {
    id: Model.ServerImmutable(WorkspaceId),
    name: Model.ServerMutableClientMutable(
      NonEmptyTrimmedString.check(Schema.isMaxLength(100))
    ),
    slug: Model.ServerMutableClientMutable(
      NonEmptyTrimmedString.check(Schema.isMaxLength(100))
    ),
    logoUrl: Model.ServerMutableClientMutableOptional(NonEmptyTrimmedString),
  },
  {
    identifier: "Workspace",
    title: "Workspace",
    description: "A workspace",
  }
) {}
