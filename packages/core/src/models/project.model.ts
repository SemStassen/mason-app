import { Schema } from "effect";
import { generateUUID } from "../utils/uuid";
import { ProjectId, WorkspaceId } from "./ids";

export class Project extends Schema.Struct({
  id: Schema.optionalWith(ProjectId, {
    default: () => ProjectId.make(generateUUID()),
  }),
  // References
  workspaceId: WorkspaceId,
  // General
  name: Schema.NonEmptyString.pipe(Schema.maxLength(100)),
  hexColor: Schema.NonEmptyString.pipe(Schema.maxLength(9)), // hex + alpha
  isBillable: Schema.Boolean,
  // Optional
  notes: Schema.NullOr(
    Schema.Record({ key: Schema.String, value: Schema.Unknown })
  ),
  metadata: Schema.NullOr(
    Schema.Struct({
      floatId: Schema.optionalWith(Schema.Number, {
        exact: true,
      }),
    })
  ),
}) {}

export const ProjectToCreate = Schema.TaggedStruct("ProjectToCreate", {
  // General
  name: Project.fields.name,
  hexColor: Schema.optionalWith(Project.fields.hexColor, {
    default: () => "#ff0000",
    exact: true,
  }),
  isBillable: Schema.optionalWith(Project.fields.isBillable, {
    default: () => true,
    exact: true,
  }),
  // Optional
  notes: Schema.optionalWith(Project.fields.notes, {
    default: () => null,
    exact: true,
  }),
  metadata: Schema.optionalWith(Project.fields.metadata, {
    default: () => null,
    exact: true,
  }),
});

export const ProjectToUpdate = Schema.TaggedStruct("ProjectToUpdate", {
  id: Project.fields.id,
  // General
  name: Schema.optionalWith(Project.fields.name, { exact: true }),
  hexColor: Schema.optionalWith(Project.fields.hexColor, { exact: true }),
  isBillable: Schema.optionalWith(Project.fields.isBillable, { exact: true }),
  // Optional
  notes: Schema.optionalWith(Project.fields.notes, { exact: true }),
  metadata: Schema.optionalWith(Project.fields.metadata, { exact: true }),
});

export const ProjectToUpsert = Schema.Union(ProjectToCreate, ProjectToUpdate);
