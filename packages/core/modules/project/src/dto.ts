import type { Project } from "./models/project.model";
import type { Task } from "./models/task.model";

export type ProjectToCreate = typeof Project.Create.Encoded;

export type ProjectToUpdate = typeof Project.Patch.Encoded & {
  id: typeof Project.fields.id.Type;
};

export type TaskToCreate = typeof Task.Create.Encoded;

export type TaskToUpdate = typeof Task.Patch.Encoded & {
  id: typeof Task.fields.id.Type;
};
