import { HexColor, ProjectId, WorkspaceId } from "@mason/framework/types";
import { JsonRecord } from "@mason/framework/utils/schema";
import { generateUUID } from "@mason/framework/utils/uuid";
import { Effect, Schema } from "effect";

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
  static readonly Create = Schema.Struct({
    name: Project.fields.name,
    hexColor: Schema.optionalWith(Project.fields.hexColor, {
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
    input: typeof Project.Create.Type,
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
    hexColor: Schema.optionalWith(Project.fields.hexColor, { exact: true }),
    isBillable: Schema.optionalWith(Project.fields.isBillable, { exact: true }),
    startDate: Schema.optionalWith(Project.fields.startDate, { exact: true }),
    endDate: Schema.optionalWith(Project.fields.endDate, { exact: true }),
    notes: Schema.optionalWith(Project.fields.notes, { exact: true }),
    _metadata: Schema.optionalWith(Project.fields._metadata, { exact: true }),
  });
  patch(updates: typeof Project.Patch.Type) {
    return Schema.decodeUnknown(Project.Patch)(updates).pipe(
      Effect.map((validated) => Project.make({ ...this, ...validated }))
    );
  }

  softDelete() {
    if (this.deletedAt) {
      return this;
    }
    return Project.make({ ...this, deletedAt: new Date() });
  }
}
