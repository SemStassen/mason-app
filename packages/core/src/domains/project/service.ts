import { Array, Context, Effect, Layer } from "effect";
import {
  type AuthorizationError,
  AuthorizationService,
} from "~/infra/authorization";
import type { ProjectId, TaskId, WorkspaceId } from "~/shared/schemas";
import { ProjectDomainError, ProjectFns, TaskFns } from "./internal";
import { ProjectRepository } from "./repositories/project.repo";
import { TaskRepository } from "./repositories/task.repo";
import type {
  CreateProjectCommand,
  CreateTaskCommand,
  PatchProjectCommand,
  PatchTaskCommand,
} from "./schemas/commands";
import type { Project } from "./schemas/project.model";
import type { Task } from "./schemas/task.model";

export class ProjectDomainService extends Context.Tag(
  "@mason/project/ProjectDomainService"
)<
  ProjectDomainService,
  {
    makeProject: (params: {
      workspaceId: WorkspaceId;
      command: CreateProjectCommand;
    }) => Effect.Effect<Project, ProjectDomainError>;
    patchProject: (params: {
      existing: Project;
      command: PatchProjectCommand;
    }) => Effect.Effect<Project, ProjectDomainError>;
    markProjectAsDeleted: (params: {
      existing: Project;
    }) => Effect.Effect<Project, ProjectDomainError>;
    saveProjects: (params: {
      workspaceId: WorkspaceId;
      existing: ReadonlyArray<Project>;
    }) => Effect.Effect<void, AuthorizationError | ProjectDomainError>;
    listProjects: (params: {
      workspaceId: WorkspaceId;
      query?: {
        ids?: Array<ProjectId>;
      };
    }) => Effect.Effect<
      ReadonlyArray<Project>,
      AuthorizationError | ProjectDomainError
    >;
    makeTask: (params: {
      workspaceId: WorkspaceId;
      projectId: ProjectId;
      command: CreateTaskCommand;
    }) => Effect.Effect<Task, ProjectDomainError>;
    patchTask: (params: {
      existing: Task;
      command: PatchTaskCommand;
    }) => Effect.Effect<Task, ProjectDomainError>;
    markTaskAsDeleted: (params: {
      existing: Task;
    }) => Effect.Effect<Task, ProjectDomainError>;
    saveTasks: (params: {
      workspaceId: WorkspaceId;
      existing: ReadonlyArray<Task>;
    }) => Effect.Effect<void, AuthorizationError | ProjectDomainError>;
    listTasks: (params: {
      workspaceId: WorkspaceId;
      query?: {
        ids?: Array<TaskId>;
        projectId?: ProjectId;
      };
    }) => Effect.Effect<
      ReadonlyArray<Task>,
      AuthorizationError | ProjectDomainError
    >;
  }
>() {
  static readonly live = Layer.effect(
    ProjectDomainService,
    Effect.gen(function* () {
      const authorization = yield* AuthorizationService;
      const projectRepo = yield* ProjectRepository;
      const taskRepo = yield* TaskRepository;

      return ProjectDomainService.of({
        makeProject: ({ workspaceId, command }) =>
          ProjectFns.create(command, { workspaceId }),

        patchProject: ({ existing, command }) =>
          ProjectFns.patch(existing, command),

        markProjectAsDeleted: ({ existing }) => ProjectFns.softDelete(existing),

        saveProjects: Effect.fn("project/ProjectModuleService.saveProjects")(
          function* ({ workspaceId, existing }) {
            if (Array.isNonEmptyReadonlyArray(existing)) {
              yield* authorization.ensureWorkspaceMatches({
                workspaceId,
                model: existing,
              });

              yield* projectRepo.upsert({ workspaceId, projects: existing });
            }
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new ProjectDomainError({ cause: e })),
          })
        ),

        listProjects: Effect.fn("project/ProjectModuleService.listProjects")(
          function* ({ workspaceId, query }) {
            const projects = yield* projectRepo.list({
              workspaceId,
              query: { ...query, _includeDeleted: false },
            });

            yield* authorization.ensureWorkspaceMatches({
              workspaceId,
              model: projects,
            });

            return projects;
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new ProjectDomainError({ cause: e })),
          })
        ),
        makeTask: ({ workspaceId, projectId, command }) =>
          TaskFns.create(command, { workspaceId, projectId }),

        patchTask: ({ existing, command }) => TaskFns.patch(existing, command),

        markTaskAsDeleted: ({ existing }) => TaskFns.softDelete(existing),

        saveTasks: Effect.fn("project/ProjectModuleService.saveTasks")(
          function* ({ workspaceId, existing }) {
            if (Array.isNonEmptyReadonlyArray(existing)) {
              yield* authorization.ensureWorkspaceMatches({
                workspaceId,
                model: existing,
              });

              yield* taskRepo.upsert({ workspaceId, tasks: existing });
            }
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new ProjectDomainError({ cause: e })),
          })
        ),

        listTasks: Effect.fn("project/ProjectModuleService.listTasks")(
          function* ({ workspaceId, query }) {
            const tasks = yield* taskRepo.list({
              workspaceId,
              query: { ...query, _includeDeleted: false },
            });

            yield* authorization.ensureWorkspaceMatches({
              workspaceId,
              model: tasks,
            });

            return tasks;
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new ProjectDomainError({ cause: e })),
          })
        ),
      });
    })
  );
}
