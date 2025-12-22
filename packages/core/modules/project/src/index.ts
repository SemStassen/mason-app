import { Layer } from "effect";
import { ProjectModuleService } from "./project-module.service";
import { ProjectRepository } from "./repositories/project.repo";
import { TaskRepository } from "./repositories/task.repo";

export * from "./dto";
export * from "./errors";
export { ProjectModuleService } from "./project-module.service";

export const ProjectModuleLive = ProjectModuleService.live.pipe(
  Layer.provide(Layer.merge(ProjectRepository.live, TaskRepository.live))
);
