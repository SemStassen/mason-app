import type { ProjectId, TaskId } from "@mason/framework";
import type { CreateProject, PatchProject } from "./project";
import type { CreateTask, PatchTask } from "./task";

export interface ProjectToCreateDTO {
  name: typeof CreateProject.Type.name;
  hexColor?: typeof CreateProject.Type.hexColor;
  isBillable?: typeof CreateProject.Type.isBillable;
  startDate?: typeof CreateProject.Type.startDate;
  endDate?: typeof CreateProject.Type.endDate;
  notes?: typeof CreateProject.Type.notes;
  _metadata?: typeof CreateProject.Type._metadata;
}

export interface ProjectToUpdateDTO {
  id: ProjectId;
  name?: typeof PatchProject.Type.name;
  hexColor?: typeof PatchProject.Type.hexColor;
  isBillable?: typeof PatchProject.Type.isBillable;
  startDate?: typeof PatchProject.Type.startDate;
  endDate?: typeof PatchProject.Type.endDate;
  notes?: typeof PatchProject.Type.notes;
  _metadata?: typeof PatchProject.Type._metadata;
}

export interface TaskToCreateDTO {
  name: typeof CreateTask.Type.name;
  _metadata?: typeof CreateTask.Type._metadata;
}

export interface TaskToUpdateDTO {
  id: TaskId;
  name?: typeof PatchTask.Type.name;
  _metadata?: typeof PatchTask.Type._metadata;
}
