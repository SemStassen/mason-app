import { Schema } from "effect";
import { Project } from "./models/project.model";
import { Task } from "./models/task.model";

export type ProjectToCreate = typeof ProjectToCreate.Type;
export const ProjectToCreate = Schema.TaggedStruct(
  "project/ProjectToCreate",
  Project.Create.fields
);

export type ProjectToUpdate = typeof ProjectToUpdate.Type;
export const ProjectToUpdate = Schema.TaggedStruct("project/ProjectToUpdate", {
  id: Project.fields.id,
  // General
  ...Project.Patch.fields,
});

export type TaskToCreate = typeof TaskToCreate.Type;
export const TaskToCreate = Schema.TaggedStruct(
  "project/TaskToCreate",
  Task.Create.fields
);

export type TaskToUpdate = typeof TaskToUpdate.Type;
export const TaskToUpdate = Schema.TaggedStruct("project/TaskToUpdate", {
  id: Task.fields.id,
  ...Task.Patch.fields,
});
