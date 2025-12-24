import {
  generateUUID,
  HexColor,
  JsonRecord,
  ProjectId,
  WorkspaceId,
} from "@mason/framework";
import { Effect, ParseResult, Schema } from "effect";

export class Project extends Schema.Class<Project>("project/Project")({
  id: ProjectId,
  // References
  workspaceId: WorkspaceId,
  // General
  name: Schema.NonEmptyString.pipe(Schema.maxLength(255)),
  hexColor: HexColor,
  isBillable: Schema.Boolean,
  // Nullable
  startDate: Schema.NullOr(Schema.DateFromSelf),
  endDate: Schema.NullOr(Schema.DateFromSelf),
  notes: Schema.NullOr(JsonRecord),
  _metadata: Schema.NullOr(
    Schema.Struct({
      source: Schema.optionalWith(Schema.Literal("float"), {
        exact: true,
      }),
      externalId: Schema.optionalWith(Schema.String, {
        exact: true,
      }),
    })
  ),
  // Metadata
  deletedAt: Schema.NullOr(Schema.DateFromSelf),
}) {
  // Schema that validates hex color string and creates HexColor
  private static readonly HexColorFromString = Schema.transformOrFail(
    Schema.NonEmptyString, // input type
    HexColor, // output type
    {
      strict: true,
      decode: (i, _, ast) =>
        Effect.sync(() => HexColor.make(i)).pipe(
          Effect.mapBoth({
            onFailure: () =>
              new ParseResult.Type(
                ast,
                i,
                `Unable to decode ${JSON.stringify(i)} into a HexColor`
              ),
            onSuccess: (hexColor) => hexColor,
          })
        ),
      encode: (i) => ParseResult.succeed(i),
    }
  );

  static readonly Create = Schema.Struct({
    name: Project.fields.name,
    hexColor: Schema.optionalWith(Project.HexColorFromString, {
      default: () => HexColor.make("#ff0000"),
      exact: true,
    }),
    isBillable: Schema.optionalWith(Project.fields.isBillable, {
      default: () => true,
      exact: true,
    }),
    startDate: Schema.optionalWith(Project.fields.startDate, {
      default: () => null,
      exact: true,
    }),
    endDate: Schema.optionalWith(Project.fields.endDate, {
      default: () => null,
      exact: true,
    }),
    notes: Schema.optionalWith(Project.fields.notes, {
      default: () => null,
      exact: true,
    }),
    _metadata: Schema.optionalWith(Project.fields._metadata, {
      default: () => null,
      exact: true,
    }),
  });
  static makeFromCreate(
    input: typeof Project.Create.Encoded,
    workspaceId: WorkspaceId
  ) {
    return Schema.decodeUnknown(Project.Create)(input).pipe(
      Effect.map((validated) =>
        Project.make({
          ...validated,
          id: ProjectId.make(generateUUID()),
          workspaceId: workspaceId,
          deletedAt: null,
        })
      )
    );
  }

  static readonly Patch = Schema.Struct({
    name: Schema.optionalWith(Project.fields.name, { exact: true }),
    hexColor: Schema.optionalWith(Project.HexColorFromString, { exact: true }),
    isBillable: Schema.optionalWith(Project.fields.isBillable, { exact: true }),
    startDate: Schema.optionalWith(Project.fields.startDate, { exact: true }),
    endDate: Schema.optionalWith(Project.fields.endDate, { exact: true }),
    notes: Schema.optionalWith(Project.fields.notes, { exact: true }),
    _metadata: Schema.optionalWith(Project.fields._metadata, { exact: true }),
  });
  patch(updates: typeof Project.Patch.Encoded) {
    return Schema.decodeUnknown(Project.Patch)(updates).pipe(
      Effect.map((validated) =>
        Project.make({
          ...this,
          ...validated,
        })
      )
    );
  }

  softDelete() {
    if (this.deletedAt) {
      return this;
    }
    return Project.make({ ...this, deletedAt: new Date() });
  }
}
