import { ProjectId, TaskId } from "@mason/framework";
import { Schema } from "effect";
import { Project, Task } from "./domain";

export type TaskToCreateDTO = typeof TaskToCreateDTO.Type;
export const TaskToCreateDTO = Schema.Struct({
  name: Task.TaskFields.fields.name,
  _metadata: Schema.optionalWith(Task.TaskFields.fields._metadata, {
    exact: true,
  }),
});

export type TaskToUpdateDTO = typeof TaskToUpdateDTO.Type;
export const TaskToUpdateDTO = Schema.Struct({
  id: TaskId,
  name: Schema.optionalWith(Task.TaskFields.fields.name, { exact: true }),
  _metadata: Schema.optionalWith(Task.TaskFields.fields._metadata, {
    exact: true,
  }),
});

export type ProjectToCreateDTO = typeof ProjectToCreateDTO.Type;
export const ProjectToCreateDTO = Schema.Struct({
  name: Project.ProjectFields.fields.name,
  hexColor: Schema.optionalWith(Schema.String, { exact: true }),
  isBillable: Schema.optionalWith(Project.ProjectFields.fields.isBillable, {
    exact: true,
  }),
  startDate: Schema.optionalWith(Project.ProjectFields.fields.startDate, {
    exact: true,
  }),
  endDate: Schema.optionalWith(Project.ProjectFields.fields.endDate, {
    exact: true,
  }),
  notes: Schema.optionalWith(Project.ProjectFields.fields.notes, {
    exact: true,
  }),
  _metadata: Schema.optionalWith(Project.ProjectFields.fields._metadata, {
    exact: true,
  }),
});

export type ProjectToUpdateDTO = typeof ProjectToUpdateDTO.Type;
export const ProjectToUpdateDTO = Schema.Struct({
  id: ProjectId,
  name: Schema.optionalWith(Project.ProjectFields.fields.name, { exact: true }),
  hexColor: Schema.optionalWith(Schema.String, { exact: true }),
  isBillable: Schema.optionalWith(Project.ProjectFields.fields.isBillable, {
    exact: true,
  }),
  startDate: Schema.optionalWith(Project.ProjectFields.fields.startDate, {
    exact: true,
  }),
  endDate: Schema.optionalWith(Project.ProjectFields.fields.endDate, {
    exact: true,
  }),
  notes: Schema.optionalWith(Project.ProjectFields.fields.notes, {
    exact: true,
  }),
  _metadata: Schema.optionalWith(Project.ProjectFields.fields._metadata, {
    exact: true,
  }),
});
