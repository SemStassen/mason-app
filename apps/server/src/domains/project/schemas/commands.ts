import { Schema } from "effect";
import { Project } from "./project.model";
import { Task } from "./task.model";

const TaskFields = Task.from.fields;
const ProjectFields = Project.from.from.fields;

export const TaskCommands = {
  Create: Schema.Struct({
    name: TaskFields.name,
  }),
  Update: Schema.Struct({
    taskId: TaskFields.id,
    name: Schema.optionalWith(TaskFields.name, { exact: true }),
  }),
};

export const ProjectCommands = {
  Create: Schema.Struct({
    name: ProjectFields.name,
    hexColor: Schema.optionalWith(ProjectFields.hexColor, { exact: true }),
    isBillable: Schema.optionalWith(ProjectFields.isBillable, { exact: true }),
    startDate: Schema.optionalWith(ProjectFields.startDate, { exact: true }),
    endDate: Schema.optionalWith(ProjectFields.endDate, { exact: true }),
    notes: Schema.optionalWith(ProjectFields.notes, { exact: true }),
  }),
  Update: Schema.Struct({
    projectId: ProjectFields.id,
    name: Schema.optionalWith(ProjectFields.name, { exact: true }),
    hexColor: Schema.optionalWith(ProjectFields.hexColor, { exact: true }),
    isBillable: Schema.optionalWith(ProjectFields.isBillable, { exact: true }),
    startDate: Schema.optionalWith(ProjectFields.startDate, { exact: true }),
    endDate: Schema.optionalWith(ProjectFields.endDate, { exact: true }),
    notes: Schema.optionalWith(ProjectFields.notes, { exact: true }),
  }),
};

export type CreateTaskCommand = typeof TaskCommands.Create.Type;
export type UpdateTaskCommand = typeof TaskCommands.Update.Type;

export type CreateProjectCommand = typeof ProjectCommands.Create.Type;
export type UpdateProjectCommand = typeof ProjectCommands.Update.Type;
