import { Effect, Option, Schema } from "effect";
import { WorkspaceId } from "~/shared/schemas";
import { generateUUID, type SchemaFields } from "~/shared/utils";

export class Workspace extends Schema.TaggedClass<Workspace>("Workspace")(
  "Workspace",
  {
    id: WorkspaceId,
    // General
    name: Schema.NonEmptyString.pipe(Schema.maxLength(100)),
    slug: Schema.NonEmptyString.pipe(Schema.maxLength(100)),
    // Optional
    logoUrl: Schema.OptionFromSelf(Schema.NonEmptyString),
    metadata: Schema.OptionFromSelf(Schema.NonEmptyString),
  },
  {
    identifier: "Workspace",
    title: "Workspace",
    description: "A workspace",
  }
) {
  private static _validate = (input: SchemaFields<typeof Workspace>) =>
    Schema.decodeUnknown(Workspace)(input);

  private static _defaults = {
    logoUrl: Option.none(),
    metadata: Option.none(),
  };

  static create = (input: CreateWorkspace) =>
    Effect.gen(function* () {
      const safeInput = yield* Schema.decodeUnknown(CreateWorkspace)(input);

      return yield* Workspace._validate({
        ...Workspace._defaults,
        ...safeInput,
        id: WorkspaceId.make(generateUUID()),
        _tag: "Workspace",
      });
    });

  patch = (input: PatchWorkspace) =>
    Effect.gen(this, function* () {
      const safeInput = yield* Schema.decodeUnknown(PatchWorkspace)(input);

      return yield* Workspace._validate({
        ...this,
        ...safeInput,
      });
    });
}

export type CreateWorkspace = typeof CreateWorkspace.Type;
export const CreateWorkspace = Schema.Struct({
  name: Workspace.fields.name,
  slug: Workspace.fields.slug,
});

export type PatchWorkspace = typeof PatchWorkspace.Type;
export const PatchWorkspace = Schema.Struct({
  name: Schema.optionalWith(Workspace.fields.name, { exact: true }),
  slug: Schema.optionalWith(Workspace.fields.slug, { exact: true }),
  logoUrl: Schema.optionalWith(Workspace.fields.logoUrl, { exact: true }),
  metadata: Schema.optionalWith(Workspace.fields.metadata, { exact: true }),
});
