import type { ProjectToCreateDTO, ProjectToUpdateDTO } from "@mason/project";
import { HexColor, JsonRecord, ProjectId, WorkspaceId } from "@mason/types";
import { Schema } from "effect";
import type { SchemaForDTO } from "../rpc/utils";

const Project = Schema.Struct({
  id: ProjectId,
  // References
  workspaceId: WorkspaceId,
  // General
  name: Schema.NonEmptyString,
  hexColor: HexColor,
  isBillable: Schema.Boolean,
  // Optional
  startDate: Schema.NullOr(Schema.DateFromSelf),
  endDate: Schema.NullOr(Schema.DateFromSelf),
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

const _CreateProjectRequest = Schema.Struct({
  // General
  name: Project.fields.name,
  hexColor: Schema.optionalWith(Project.fields.hexColor, {
    exact: true,
  }),
  isBillable: Schema.optionalWith(Project.fields.isBillable, {
    exact: true,
  }),
  // Optional
  startDate: Schema.optionalWith(Project.fields.startDate, {
    exact: true,
  }),
  endDate: Schema.optionalWith(Project.fields.endDate, {
    exact: true,
  }),
  notes: Schema.optionalWith(Project.fields.notes, {
    exact: true,
  }),
  _metadata: Schema.optionalWith(Project.fields._metadata, {
    exact: true,
  }),
});

export const CreateProjectRequest: SchemaForDTO<
  typeof _CreateProjectRequest,
  ProjectToCreateDTO
> = _CreateProjectRequest;

const _UpdateProjectRequest = Schema.Struct({
  id: Project.fields.id,
  // General
  name: Schema.optionalWith(Project.fields.name, { exact: true }),
  hexColor: Schema.optionalWith(Project.fields.hexColor, { exact: true }),
  isBillable: Schema.optionalWith(Project.fields.isBillable, { exact: true }),
  // Optional
  startDate: Schema.optionalWith(Project.fields.startDate, { exact: true }),
  endDate: Schema.optionalWith(Project.fields.endDate, { exact: true }),
  notes: Schema.optionalWith(Schema.NullOr(Project.fields.notes), {
    exact: true,
  }),
  _metadata: Schema.optionalWith(Project.fields._metadata, { exact: true }),
});

export const UpdateProjectRequest: SchemaForDTO<
  typeof _UpdateProjectRequest,
  ProjectToUpdateDTO
> = _UpdateProjectRequest;

export const ProjectResponse = Schema.TaggedStruct("ProjectResponse", {
  ...Project.fields,
  // Optional
  notes: Schema.NullOr(Project.fields.notes),
  _metadata: Schema.NullOr(Project.fields._metadata),
});
