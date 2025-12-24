import type { Project } from "./models/project.model";
import type { Task } from "./models/task.model";

export type ProjectToCreate = typeof Project.Create.Type;

export type ProjectToUpdate = typeof Project.Patch.Type & {
  id: typeof Project.fields.id.Type;
};

export type TaskToCreate = typeof Task.Create.Type;

export type TaskToUpdate = typeof Task.Patch.Type & {
  id: typeof Task.fields.id.Type;
};
