import { Layer } from "effect";
import { ProjectRepository } from "./project.repo";
import { ProjectModuleService } from "./project-module.service";
import { TaskRepository } from "./task.repo";

export * from "./dto";
export * from "./errors";
export { ProjectModuleService } from "./project-module.service";

export const ProjectModuleLive = ProjectModuleService.live.pipe(
  Layer.provide(Layer.merge(ProjectRepository.live, TaskRepository.live))
);
