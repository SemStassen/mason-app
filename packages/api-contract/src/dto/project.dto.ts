import { Schema } from "effect";

class Project extends Schema.Struct({
  id: Schema.NonEmptyString,
  // References
  workspaceId: Schema.NonEmptyString,
  // General
  name: Schema.NonEmptyString,
  hexColor: Schema.NonEmptyString.annotations({
    description: "Hex + alpha",
    examples: ["#C8102E", "#FFFFFF", "#003DA5", "#D4AF3740"],
  }),
  isBillable: Schema.Boolean,
  // Optional
  notes: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  metadata: Schema.Struct({
    floatId: Schema.optionalWith(Schema.Number, {
      exact: true,
    }),
  }),
}) {}

export const CreateProjectRequest = Schema.Struct({
  // General
  name: Project.fields.name,
  hexColor: Schema.optionalWith(Project.fields.hexColor, {
    exact: true,
  }),
  isBillable: Schema.optionalWith(Project.fields.isBillable, {
    exact: true,
  }),
  // Optional
  notes: Schema.optionalWith(Project.fields.notes, {
    exact: true,
  }),
  metadata: Schema.optionalWith(Project.fields.metadata, {
    exact: true,
  }),
});

export const UpdateProjectRequest = Schema.Struct({
  id: Project.fields.id,
  // General
  name: Schema.optionalWith(Project.fields.name, { exact: true }),
  hexColor: Schema.optionalWith(Project.fields.hexColor, { exact: true }),
  isBillable: Schema.optionalWith(Project.fields.isBillable, { exact: true }),
  // Optional
  notes: Schema.optionalWith(Schema.NullOr(Project.fields.notes), {
    exact: true,
  }),
  metadata: Schema.optionalWith(Schema.NullOr(Project.fields.metadata), {
    exact: true,
  }),
});

export const UpsertProjectRequest = Schema.Union(
  CreateProjectRequest,
  UpdateProjectRequest
);
