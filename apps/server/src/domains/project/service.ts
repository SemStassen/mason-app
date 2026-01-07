import { Context, Effect, Layer, Option } from "effect";
import { AuthorizationService } from "~/application/authorization";
import type { AuthorizationError } from "~/shared/errors/authorization";
import type { ProjectId, TaskId, WorkspaceId } from "~/shared/schemas";
import { processArray } from "~/shared/utils";
import {
  ProjectDomainError,
  ProjectFns,
  ProjectNotFoundError,
  TaskFns,
  TaskNotFoundError,
} from "./internal";
import { ProjectRepository } from "./repositories/project.repo";
import { TaskRepository } from "./repositories/task.repo";
import type {
  CreateProjectCommand,
  CreateTaskCommand,
  UpdateProjectCommand,
  UpdateTaskCommand,
} from "./schemas/commands";
import type { Project } from "./schemas/project.model";
import type { Task } from "./schemas/task.model";

export class ProjectDomainService extends Context.Tag(
  "@mason/project/ProjectDomainService"
)<
  ProjectDomainService,
  {
    createProjects: (params: {
      workspaceId: WorkspaceId;
      projects: ReadonlyArray<CreateProjectCommand>;
    }) => Effect.Effect<ReadonlyArray<Project>, ProjectDomainError>;
    updateProjects: (params: {
      workspaceId: WorkspaceId;
      projects: ReadonlyArray<UpdateProjectCommand>;
    }) => Effect.Effect<
      ReadonlyArray<Project>,
      AuthorizationError | ProjectDomainError | ProjectNotFoundError
    >;
    softDeleteProjects: (params: {
      workspaceId: WorkspaceId;
      projectIds: ReadonlyArray<ProjectId>;
    }) => Effect.Effect<
      void,
      AuthorizationError | ProjectDomainError | ProjectNotFoundError
    >;
    listProjects: (params: {
      workspaceId: WorkspaceId;
      query?: {
        ids?: Array<ProjectId>;
      };
    }) => Effect.Effect<ReadonlyArray<Project>, ProjectDomainError>;
    createTasks: (params: {
      workspaceId: WorkspaceId;
      projectId: ProjectId;
      tasks: ReadonlyArray<CreateTaskCommand>;
    }) => Effect.Effect<
      ReadonlyArray<Task>,
      AuthorizationError | ProjectDomainError | ProjectNotFoundError
    >;
    updateTasks: (params: {
      workspaceId: WorkspaceId;
      tasks: ReadonlyArray<UpdateTaskCommand>;
    }) => Effect.Effect<
      ReadonlyArray<Task>,
      AuthorizationError | ProjectDomainError | TaskNotFoundError
    >;
    softDeleteTasks: (params: {
      workspaceId: WorkspaceId;
      taskIds: ReadonlyArray<TaskId>;
    }) => Effect.Effect<
      void,
      AuthorizationError | ProjectDomainError | TaskNotFoundError
    >;
    listTasks: (params: {
      workspaceId: WorkspaceId;
      query?: {
        ids?: Array<TaskId>;
        projectId?: ProjectId;
      };
    }) => Effect.Effect<ReadonlyArray<Task>, ProjectDomainError>;
  }
>() {
  static readonly live = Layer.effect(
    ProjectDomainService,
    Effect.gen(function* () {
      const authorization = yield* AuthorizationService;
      const projectRepo = yield* ProjectRepository;
      const taskRepo = yield* TaskRepository;

      return ProjectDomainService.of({
        createProjects: Effect.fn(
          "project/ProjectModuleService.createProjects"
        )(({ workspaceId, projects }) =>
          processArray({
            items: projects,
            onEmpty: Effect.succeed([]),
            mapItem: (project) => ProjectFns.create(project, { workspaceId }),
            execute: (projects) =>
              projectRepo.insert({ workspaceId, projects }),
          }).pipe(
            Effect.catchTags({
              "shared/DatabaseError": (e) =>
                Effect.fail(new ProjectDomainError({ cause: e })),
              ParseError: (e) =>
                Effect.fail(new ProjectDomainError({ cause: e })),
            })
          )
        ),
        updateProjects: Effect.fn(
          "project/ProjectModuleService.updateProjects"
        )(({ workspaceId, projects }) =>
          processArray({
            items: projects,
            onEmpty: Effect.succeed([]),
            prepare: (updates) =>
              Effect.gen(function* () {
                const existingProjects = yield* projectRepo.list({
                  workspaceId,
                  query: { ids: updates.map((p) => p.id) },
                });

                yield* authorization.ensureWorkspaceMatches({
                  workspaceId,
                  model: existingProjects,
                });

                return new Map(existingProjects.map((e) => [e.id, e]));
              }),
            mapItem: (update, existingMap) =>
              Effect.gen(function* () {
                const existing = existingMap.get(update.id);

                if (!existing) {
                  return yield* Effect.fail(new ProjectNotFoundError());
                }
                return yield* ProjectFns.update(existing, update);
              }),
            execute: (projectsToUpdate) =>
              projectRepo.update({ workspaceId, projects: projectsToUpdate }),
          }).pipe(
            Effect.catchTags({
              "shared/DatabaseError": (e) =>
                Effect.fail(new ProjectDomainError({ cause: e })),
              ParseError: (e) =>
                Effect.fail(new ProjectDomainError({ cause: e })),
            })
          )
        ),
        softDeleteProjects: Effect.fn(
          "project/ProjectModuleService.softDeleteProjects"
        )(({ workspaceId, projectIds }) =>
          processArray({
            items: projectIds,
            onEmpty: Effect.void,
            prepare: (projectIds) =>
              Effect.gen(function* () {
                const existingProjects = yield* projectRepo.list({
                  workspaceId,
                  query: { ids: projectIds },
                });

                yield* authorization.ensureWorkspaceMatches({
                  workspaceId,
                  model: existingProjects,
                });

                return new Map(existingProjects.map((e) => [e.id, e]));
              }),
            mapItem: (projectId, existingMap) =>
              Effect.gen(function* () {
                const existing = existingMap.get(projectId);

                if (!existing) {
                  return yield* Effect.fail(new ProjectNotFoundError());
                }

                return yield* ProjectFns.softDelete(existing).pipe(
                  Effect.map((p) => p.id)
                );
              }),
            execute: (projectIdsToSoftDelete) =>
              projectRepo.softDelete({
                workspaceId,
                projectIds: projectIdsToSoftDelete,
              }),
          }).pipe(
            Effect.catchTags({
              "shared/DatabaseError": (e) =>
                Effect.fail(new ProjectDomainError({ cause: e })),
              ParseError: (e) =>
                Effect.fail(new ProjectDomainError({ cause: e })),
            })
          )
        ),
        listProjects: Effect.fn("project/ProjectModuleService.listProjects")(
          ({ workspaceId, query }) =>
            projectRepo
              .list({
                workspaceId,
                query: { ...query, _includeDeleted: false },
              })
              .pipe(
                Effect.catchTags({
                  "shared/DatabaseError": (e) =>
                    Effect.fail(new ProjectDomainError({ cause: e })),
                })
              )
        ),
        createTasks: Effect.fn("project/ProjectModuleService.createTasks")(
          ({ workspaceId, projectId, tasks }) =>
            processArray({
              items: tasks,
              onEmpty: Effect.succeed([]),
              prepare: () =>
                Effect.gen(function* () {
                  const existingProject = yield* projectRepo
                    .retrieve({
                      workspaceId,
                      query: { id: projectId },
                    })
                    .pipe(
                      Effect.flatMap(
                        Option.match({
                          onNone: () => Effect.fail(new ProjectNotFoundError()),
                          onSome: Effect.succeed,
                        })
                      )
                    );

                  yield* authorization.ensureWorkspaceMatches({
                    workspaceId,
                    model: [existingProject],
                  });

                  return existingProject;
                }),
              mapItem: (task, existingProject) =>
                TaskFns.create(task, {
                  workspaceId,
                  projectId: existingProject.id,
                }),
              execute: (tasks) => taskRepo.insert({ workspaceId, tasks }),
            }).pipe(
              Effect.catchTags({
                "shared/DatabaseError": (e) =>
                  Effect.fail(new ProjectDomainError({ cause: e })),
                ParseError: (e) =>
                  Effect.fail(new ProjectDomainError({ cause: e })),
              })
            )
        ),
        updateTasks: Effect.fn("project/ProjectModuleService.updateTasks")(
          ({ workspaceId, tasks }) =>
            processArray({
              items: tasks,
              onEmpty: Effect.succeed([]),
              prepare: (updates) =>
                Effect.gen(function* () {
                  const existingTasks = yield* taskRepo.list({
                    workspaceId,
                    query: { ids: updates.map((t) => t.id) },
                  });

                  yield* authorization.ensureWorkspaceMatches({
                    workspaceId,
                    model: existingTasks,
                  });

                  return new Map(existingTasks.map((e) => [e.id, e]));
                }),
              mapItem: (update, existingMap) =>
                Effect.gen(function* () {
                  const existing = existingMap.get(update.id);

                  if (!existing) {
                    return yield* Effect.fail(new TaskNotFoundError());
                  }
                  return yield* TaskFns.update(existing, update);
                }),
              execute: (tasksToUpdate) =>
                taskRepo.update({ workspaceId, tasks: tasksToUpdate }),
            }).pipe(
              Effect.catchTags({
                "shared/DatabaseError": (e) =>
                  Effect.fail(new ProjectDomainError({ cause: e })),
                ParseError: (e) =>
                  Effect.fail(new ProjectDomainError({ cause: e })),
              })
            )
        ),
        softDeleteTasks: Effect.fn(
          "project/ProjectModuleService.softDeleteTasks"
        )(({ workspaceId, taskIds }) =>
          processArray({
            items: taskIds,
            onEmpty: Effect.void,
            prepare: (taskIds) =>
              Effect.gen(function* () {
                const existingTasks = yield* taskRepo.list({
                  workspaceId,
                  query: { ids: taskIds },
                });

                yield* authorization.ensureWorkspaceMatches({
                  workspaceId,
                  model: existingTasks,
                });

                return new Map(existingTasks.map((e) => [e.id, e]));
              }),
            mapItem: (taskId, existingMap) =>
              Effect.gen(function* () {
                const existing = existingMap.get(taskId);

                if (!existing) {
                  return yield* Effect.fail(new TaskNotFoundError());
                }

                return yield* TaskFns.softDelete(existing).pipe(
                  Effect.map((t) => t.id)
                );
              }),
            execute: (taskIdsToSoftDelete) =>
              taskRepo.softDelete({
                workspaceId,
                taskIds: taskIdsToSoftDelete,
              }),
          }).pipe(
            Effect.catchTags({
              "shared/DatabaseError": (e) =>
                Effect.fail(new ProjectDomainError({ cause: e })),
              ParseError: (e) =>
                Effect.fail(new ProjectDomainError({ cause: e })),
            })
          )
        ),
        listTasks: Effect.fn("project/ProjectModuleService.listTasks")(
          ({ workspaceId, query }) =>
            taskRepo
              .list({
                workspaceId,
                query: { ...query, _includeDeleted: false },
              })
              .pipe(
                Effect.catchTags({
                  "shared/DatabaseError": (e) =>
                    Effect.fail(new ProjectDomainError({ cause: e })),
                })
              )
        ),
      });
    })
  );
}
