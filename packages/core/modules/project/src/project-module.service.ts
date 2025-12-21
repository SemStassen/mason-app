import type { ProjectId, TaskId, WorkspaceId } from "@mason/framework/types/ids";
import { Context, Effect, Layer } from "effect";
import type { Project } from "./models/project.model";
import { ProjectRepository } from "./repositories/project.repo";
import { TaskRepository } from "./repositories/task.repo";
import { GenericProjectModuleError, ProjectModuleError } from "./errors";
import type { Task } from "./models/task.model";

export class ProjectModuleService extends Context.Tag(
  "@mason/project/ProjectModuleService"
)<
  ProjectModuleService,
  {
    createProjects: (params: {
      workspaceId: WorkspaceId;
      projects: Array<Project>;
    }) => Effect.Effect<readonly Project[], ProjectModuleError>;
    updateProjects: (params: {
      workspaceId: WorkspaceId;
      projects: Array<Project>;
    }) => Effect.Effect<readonly Project[], ProjectModuleError>;
    softDeleteProjects: (params: {
      workspaceId: WorkspaceId;
      projectIds: Array<ProjectId>;
    }) => Effect.Effect<void, ProjectModuleError>;
    hardDeleteProjects: (params: {
      workspaceId: WorkspaceId;
      projectIds: Array<ProjectId>;
    }) => Effect.Effect<void, ProjectModuleError>;
    listProjects: (params: {
      workspaceId: WorkspaceId;
      query?: {
        ids?: Array<ProjectId>;
        _source?: "float";
        _externalIds?: Array<string>;
      };
    }) => Effect.Effect<readonly Project[], ProjectModuleError>;
    createTasks: (params: {
      workspaceId: WorkspaceId;
      tasks: Array<Task>;
    }) => Effect.Effect<readonly Task[], ProjectModuleError>;
    updateTasks: (params: {
      workspaceId: WorkspaceId;
      tasks: Array<Task>;
    }) => Effect.Effect<readonly Task[], ProjectModuleError>;
    softDeleteTasks: (params: {
      workspaceId: WorkspaceId;
      taskIds: Array<TaskId>;
    }) => Effect.Effect<void, ProjectModuleError>;
    hardDeleteTasks: (params: {
      workspaceId: WorkspaceId;
      taskIds: Array<TaskId>;
    }) => Effect.Effect<void, ProjectModuleError>;
    listTasks: (params: {
      workspaceId: WorkspaceId;
      query?: {
        ids?: Array<TaskId>;
        projectIds?: Array<ProjectId>;
        _source?: "float";
        _externalIds?: Array<string>;
      };
    }) => Effect.Effect<readonly Task[], ProjectModuleError>;
  }
>() {
  static readonly live = Layer.effect(
    ProjectModuleService,
    Effect.gen(function* () {
      const projectRepository = yield* ProjectRepository;
      const taskRepository = yield* TaskRepository;

      return ProjectModuleService.of({
        createProjects: (params) =>
          projectRepository
            .insertProjects(params)
            .pipe(
              Effect.mapError(
                (e) => new GenericProjectModuleError({ cause: e })
              )
            ),
        updateProjects: (params) =>
          projectRepository
            .updateProjects(params)
            .pipe(
              Effect.mapError(
                (e) => new GenericProjectModuleError({ cause: e })
              )
            ),
        softDeleteProjects: (params) =>
          projectRepository
            .softDeleteProjects(params)
            .pipe(
              Effect.mapError(
                (e) => new GenericProjectModuleError({ cause: e })
              )
            ),
        hardDeleteProjects: (params) =>
          projectRepository
            .hardDeleteProjects(params)
            .pipe(
              Effect.mapError(
                (e) => new GenericProjectModuleError({ cause: e })
              )
            ),
        listProjects: (params) =>
          projectRepository
            .listProjects(params)
            .pipe(
              Effect.mapError(
                (e) => new GenericProjectModuleError({ cause: e })
              )
            ),
        createTasks: (params) =>
          taskRepository
            .insertTasks(params)
            .pipe(
              Effect.mapError(
                (e) => new GenericProjectModuleError({ cause: e })
              )
            ),
        updateTasks: (params) =>
          taskRepository
            .updateTasks(params)
            .pipe(
              Effect.mapError(
                (e) => new GenericProjectModuleError({ cause: e })
              )
            ),
        softDeleteTasks: (params) =>
          taskRepository
            .softDeleteTasks(params)
            .pipe(
              Effect.mapError(
                (e) => new GenericProjectModuleError({ cause: e })
              )
            ),
        hardDeleteTasks: (params) =>
          taskRepository
            .hardDeleteTasks(params)
            .pipe(
              Effect.mapError(
                (e) => new GenericProjectModuleError({ cause: e })
              )
            ),
        listTasks: (params) =>
          taskRepository
            .listTasks(params)
            .pipe(
              Effect.mapError(
                (e) => new GenericProjectModuleError({ cause: e })
              )
            ),
      });
    })
  );
}
