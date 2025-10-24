import type { ProjectResponse } from "@mason/api-contract/dto/project.dto.d";
import type { TaskResponse } from "@mason/api-contract/dto/task.dto.d";

export type Project = typeof ProjectResponse.Type;
export type Task = typeof TaskResponse.Type;
