import { Layer } from "effect";
import { ProjectRepository } from "./infra/project.repo";
import { TaskRepository } from "./infra/task.repo";
import { ProjectModuleService } from "./project-module.service";

export * from "./dto";
export * from "./errors";
export { ProjectModuleService } from "./project-module.service";

export const ProjectModuleLive = ProjectModuleService.live.pipe(
  Layer.provide(Layer.merge(ProjectRepository.live, TaskRepository.live))
);
