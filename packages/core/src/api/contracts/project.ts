import { Schema } from "effect";
import { Project } from "#modules/project/index";

export const CreateProjectCommand = Project.jsonCreate;
export const CreateProjectResult = Project.json;

export const UpdateProjectCommand = Schema.Struct({
  id: Project.fields.id,
  data: Project.jsonUpdate,
});
export const UpdateProjectResult = Project.json;

export const ArchiveProjectCommand = Schema.Struct({
  id: Project.fields.id,
});
export const ArchiveProjectResult = Schema.Void;

export const RestoreProjectCommand = Schema.Struct({
  id: Project.fields.id,
});
export const RestoreProjectResult = Schema.Void;
