import { Schema } from "effect";
import { JsonRecord } from "./data-types";

const Project = Schema.Struct({
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
  notes: JsonRecord,
  _metadata: Schema.Struct({
    source: Schema.optionalWith(Schema.Literal("float"), {
      exact: true,
    }),
    externalId: Schema.optionalWith(Schema.String, {
      exact: true,
    }),
  }),
});

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
});

export const ProjectResponse = Schema.TaggedStruct("ProjectResponse", {
  ...Project.fields,
  // Optional
  notes: Schema.NullOr(Project.fields.notes),
  _metadata: Schema.NullOr(Project.fields._metadata),
});
