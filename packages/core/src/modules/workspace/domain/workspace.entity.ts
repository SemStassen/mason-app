import { Effect, Option, Schema } from "effect";
import { Model, WorkspaceId } from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";

export class Workspace extends Model.Class<Workspace>("Workspace")(
  {
    id: Model.DomainManaged(WorkspaceId),
    name: Model.Mutable(Schema.NonEmptyString.pipe(Schema.maxLength(100))),
    slug: Model.Mutable(Schema.NonEmptyString.pipe(Schema.maxLength(100))),
    logoUrl: Model.OptionalMutable(
      Schema.OptionFromSelf(Schema.NonEmptyString)
    ),
    metadata: Model.OptionalMutable(
      Schema.OptionFromSelf(Schema.NonEmptyString)
    ),
  },
  {
    identifier: "Workspace",
    title: "Workspace",
    description: "A workspace",
  }
) {
  private static _validate = (input: typeof Workspace.entity.Type) =>
    Schema.validate(Workspace)(input);

  static fromInput = (input: typeof Workspace.actionCreate.Type) =>
    Effect.gen(function* () {
      const safeInput = yield* Schema.decodeUnknown(Workspace.actionCreate)(input);

      return yield* Workspace._validate({
        ...safeInput,
        id: WorkspaceId.make(generateUUID()),
        logoUrl: safeInput.logoUrl ?? Option.none(),
        metadata: safeInput.metadata ?? Option.none(),
      });
    });

  patch = (patch: typeof Workspace.actionPatch.Type) =>
    Effect.gen(this, function* () {
      const safePatch = yield* Schema.decodeUnknown(Workspace.actionPatch)(patch);

      return yield* Workspace._validate({
        ...this,
        ...safePatch,
      });
    });
}
