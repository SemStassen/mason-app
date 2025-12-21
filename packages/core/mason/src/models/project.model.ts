import type { DbProject } from "@mason/db/schema";
import { Effect, Schema } from "effect";
import { generateUUID } from "../utils/uuid";
import { ProjectId, WorkspaceId } from "./ids";
import { JsonRecord } from "./data-types";

export class Project extends Schema.Class<Project>("@mason/mason/project")({
  id: ProjectId,
  // References
  workspaceId: WorkspaceId,
  // General
  name: Schema.NonEmptyString.pipe(Schema.maxLength(255)),
  hexColor: Schema.NonEmptyString.pipe(Schema.maxLength(9)), // # + hex + alpha
  isBillable: Schema.Boolean,
  // Nullable
  startDate: Schema.NullOr(
    Schema.Union(Schema.DateFromSelf, Schema.DateFromString)
  ),
  endDate: Schema.NullOr(
    Schema.Union(Schema.DateFromSelf, Schema.DateFromString)
  ),
  notes: Schema.NullOr(
    JsonRecord
  ),
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
}) {
  static makeFromDb(dbRecord: DbProject) {
    // biome-ignore lint/correctness/useYield: These should be effects
    return Effect.gen(function* () {
      return new Project({
        ...dbRecord,
        id: ProjectId.make(dbRecord.id),
        workspaceId: WorkspaceId.make(dbRecord.workspaceId),
      });
    });
  }

  static makeFromCreate(
    input: typeof ProjectToCreate.Type,
    workspaceId: typeof WorkspaceId.Type
  ) {
    // biome-ignore lint/correctness/useYield: These should be effects
    return Effect.gen(function* () {
      return new Project({
        ...input,
        id: ProjectId.make(generateUUID()),
        workspaceId: workspaceId,
      });
    });
  }

  static makeFromUpdate(
    input: typeof ProjectToUpdate.Type,
    existing: DbProject
  ) {
    return Effect.gen(function* () {
      const existingProject = yield* Project.makeFromDb(existing);
      return new Project({
        ...existingProject,
        ...input,
        workspaceId: WorkspaceId.make(existing.workspaceId),
      });
    });
  }
}

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

export const ProjectToUpdate = Schema.TaggedStruct("ProjectToUpdate", {
  id: Project.fields.id,
  // General
  name: Schema.optionalWith(Project.fields.name, { exact: true }),
  hexColor: Schema.optionalWith(Project.fields.hexColor, { exact: true }),
  isBillable: Schema.optionalWith(Project.fields.isBillable, { exact: true }),
  // Optional
  startDate: Schema.optionalWith(Project.fields.startDate, { exact: true }),
  endDate: Schema.optionalWith(Project.fields.endDate, { exact: true }),
  notes: Schema.optionalWith(Project.fields.notes, { exact: true }),
  _metadata: Schema.optionalWith(Project.fields._metadata, { exact: true }),
});

export const ProjectToUpsert = Schema.Union(ProjectToCreate, ProjectToUpdate);
