import {
  type DatabaseError,
  ExistingProjectId,
  ExistingTaskId,
  ExistingWorkspaceId,
  ProjectId,
  processArray,
  TaskId,
} from "@mason/framework";
import { Context, Effect, Layer, Option } from "effect";
import type { ParseError } from "effect/ParseResult";
import type {
  ProjectToCreateDTO,
  ProjectToUpdateDTO,
  TaskToCreateDTO,
  TaskToUpdateDTO,
} from "./dto";
import {
  InternalProjectModuleError,
  ProjectNotFoundError,
  TaskNotFoundError,
} from "./errors";
import {
  createProject,
  Project,
  type Project as ProjectType,
  softDeleteProject,
  updateProject,
} from "./project";
import { ProjectRepository } from "./project.repo";
import {
  createTask,
  softDeleteTask,
  Task,
  type Task as TaskType,
  updateTask,
} from "./task";
import { TaskRepository } from "./task.repo";

export class ProjectModuleService extends Context.Tag(
  "@mason/project/ProjectModuleService"
)<
  ProjectModuleService,
  {
    createProjects: (params: {
      workspaceId: ExistingWorkspaceId;
      projects: ReadonlyArray<ProjectToCreateDTO>;
    }) => Effect.Effect<ReadonlyArray<ProjectType>, InternalProjectModuleError>;
    updateProjects: (params: {
      workspaceId: ExistingWorkspaceId;
      projects: ReadonlyArray<ProjectToUpdateDTO>;
    }) => Effect.Effect<
      ReadonlyArray<ProjectType>,
      InternalProjectModuleError | ProjectNotFoundError
    >;
    softDeleteProjects: (params: {
      workspaceId: ExistingWorkspaceId;
      projectIds: ReadonlyArray<ProjectId>;
    }) => Effect.Effect<void, InternalProjectModuleError>;
    hardDeleteProjects: (params: {
      workspaceId: ExistingWorkspaceId;
      projectIds: ReadonlyArray<ProjectId>;
    }) => Effect.Effect<void, InternalProjectModuleError>;
    listProjects: (params: {
      workspaceId: ExistingWorkspaceId;
      query?: {
        ids?: Array<ProjectId>;
        _source?: "float";
        _externalIds?: Array<string>;
      };
    }) => Effect.Effect<ReadonlyArray<ProjectType>, InternalProjectModuleError>;
    createTasks: (params: {
      workspaceId: ExistingWorkspaceId;
      projectId: ProjectId;
      tasks: ReadonlyArray<TaskToCreateDTO>;
    }) => Effect.Effect<
      ReadonlyArray<TaskType>,
      InternalProjectModuleError | ProjectNotFoundError
    >;
    updateTasks: (params: {
      workspaceId: ExistingWorkspaceId;
      projectId: ProjectId;
      tasks: ReadonlyArray<TaskToUpdateDTO>;
    }) => Effect.Effect<
      ReadonlyArray<TaskType>,
      InternalProjectModuleError | TaskNotFoundError
    >;
    softDeleteTasks: (params: {
      workspaceId: ExistingWorkspaceId;
      projectId: ProjectId;
      taskIds: ReadonlyArray<TaskId>;
    }) => Effect.Effect<void, InternalProjectModuleError>;
    hardDeleteTasks: (params: {
      workspaceId: ExistingWorkspaceId;
      projectId: ProjectId;
      taskIds: ReadonlyArray<TaskId>;
    }) => Effect.Effect<void, InternalProjectModuleError>;
    listTasks: (params: {
      workspaceId: ExistingWorkspaceId;
      projectId: ProjectId;
      query?: {
        ids?: Array<TaskId>;
        _source?: "float";
        _externalIds?: Array<string>;
      };
    }) => Effect.Effect<ReadonlyArray<TaskType>, InternalProjectModuleError>;
  }
>() {
  static readonly live = Layer.effect(
    ProjectModuleService,
    Effect.gen(function* () {
      const projectRepo = yield* ProjectRepository;
      const taskRepo = yield* TaskRepository;

      return ProjectModuleService.of({
        createProjects: Effect.fn(
          "@mason/project/ProjectModuleService.createProjects"
        )(({ workspaceId, projects }) =>
          processArray({
            items: projects,
            onEmpty: Effect.succeed([]),
            execute: (nea) =>
              Effect.gen(function* () {
                const projectsToCreate = yield* Effect.forEach(nea, (p) =>
                  createProject({
                    ...p,
                    workspaceId: ExistingWorkspaceId.make(workspaceId),
                  })
                );

                return yield* projectRepo.insert(projectsToCreate);
              }),
          }).pipe(
            Effect.catchTags({
              "@mason/framework/DatabaseError": (e) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
              ParseError: (e) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
            })
          )
        ),
        updateProjects: Effect.fn(
          "@mason/project/ProjectModuleService.updateProjects"
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
                return new Map(
                  existingProjects.map((e) => [ProjectId.make(e.id), e])
                );
              }),
            mapItem: (update, existingMap) =>
              Effect.gen(function* () {
                const existing = existingMap.get(update.id);

                if (!existing) {
                  return yield* Effect.fail(
                    new ProjectNotFoundError({ projectId: update.id })
                  );
                }
                const { id, ...patchData } = update;
                return yield* updateProject(existing, patchData);
              }),
            execute: (projectsToUpdate) => projectRepo.update(projectsToUpdate),
          }).pipe(
            Effect.catchTags({
              "@mason/framework/DatabaseError": (e: DatabaseError) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
              ParseError: (e: ParseError) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
            })
          )
        ),
        softDeleteProjects: Effect.fn(
          "@mason/project/ProjectModuleService.softDeleteProjects"
        )(({ workspaceId, projectIds }) =>
          processArray({
            items: projectIds,
            schema: ProjectId,
            onEmpty: Effect.void,
            execute: (nea) =>
              Effect.gen(function* () {
                const existingProjects = yield* projectRepo.list({
                  workspaceId,
                  query: {
                    ids: nea,
                  },
                });

                const deletedProjects = existingProjects.map(softDeleteProject);

                yield* processArray({
                  items: deletedProjects,
                  schema: Project,
                  onEmpty: Effect.void,
                  execute: (nea) => projectRepo.update(nea).pipe(Effect.asVoid),
                });
              }),
          }).pipe(
            Effect.catchTags({
              "@mason/framework/DatabaseError": (e) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
              ParseError: (e) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
            })
          )
        ),
        hardDeleteProjects: Effect.fn(
          "@mason/project/ProjectModuleService.hardDeleteProjects"
        )(({ workspaceId, projectIds }) =>
          processArray({
            items: projectIds,
            schema: ProjectId,
            onEmpty: Effect.void,
            execute: (nea) =>
              Effect.gen(function* () {
                const existingProjects = yield* projectRepo.list({
                  workspaceId,
                  query: {
                    ids: nea,
                  },
                });

                yield* processArray({
                  items: existingProjects.map((existing) => existing.id),
                  schema: ExistingProjectId,
                  onEmpty: Effect.void,
                  execute: (nea) => projectRepo.hardDelete(nea),
                });
              }),
          }).pipe(
            Effect.catchTags({
              "@mason/framework/DatabaseError": (e) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
              ParseError: (e) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
            })
          )
        ),
        listProjects: Effect.fn(
          "@mason/project/ProjectModuleService.listProjects"
        )((params) =>
          projectRepo.list(params).pipe(
            Effect.catchTags({
              "@mason/framework/DatabaseError": (e) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
            })
          )
        ),
        createTasks: Effect.fn(
          "@mason/project/ProjectModuleService.createTasks"
        )(({ workspaceId, projectId, tasks }) =>
          processArray({
            items: tasks,
            onEmpty: Effect.succeed([]),
            execute: (nea) =>
              Effect.gen(function* () {
                const existingProjectId = yield* projectRepo
                  .retrieve({
                    workspaceId,
                    projectId,
                  })
                  .pipe(
                    Effect.flatMap((option) =>
                      Option.match(option, {
                        onNone: () =>
                          Effect.fail(new ProjectNotFoundError({ projectId })),
                        onSome: (project) => Effect.succeed(project.id),
                      })
                    )
                  );

                const tasksToCreate = yield* Effect.forEach(nea, (task) =>
                  createTask({
                    ...task,
                    workspaceId: ExistingWorkspaceId.make(workspaceId),
                    projectId: existingProjectId,
                    _metadata: task._metadata ?? null,
                  })
                );

                return yield* taskRepo.insert(tasksToCreate);
              }),
          }).pipe(
            Effect.catchTags({
              "@mason/framework/DatabaseError": (e: DatabaseError) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
              ParseError: (e: ParseError) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
            })
          )
        ),
        updateTasks: Effect.fn(
          "@mason/project/ProjectModuleService.updateTasks"
        )(({ workspaceId, projectId, tasks }) =>
          processArray({
            items: tasks,
            onEmpty: Effect.succeed([]),
            prepare: (updates) =>
              Effect.gen(function* () {
                const existingTasks = yield* taskRepo.list({
                  workspaceId: workspaceId,
                  query: {
                    ids: updates.map((task) => task.id),
                    projectIds: [projectId],
                  },
                });

                return new Map(
                  existingTasks.map((e) => [TaskId.make(e.id), e])
                );
              }),
            mapItem: (update, existingMap) =>
              Effect.gen(function* () {
                const existing = existingMap.get(update.id);
                if (!existing) {
                  return yield* Effect.fail(
                    new TaskNotFoundError({
                      taskId: update.id,
                    })
                  );
                }
                const { id, ...patchData } = update;
                return yield* updateTask(existing, patchData);
              }),
            execute: (tasksToUpdate) => taskRepo.update(tasksToUpdate),
          }).pipe(
            Effect.catchTags({
              "@mason/framework/DatabaseError": (e: DatabaseError) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
              ParseError: (e: ParseError) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
            })
          )
        ),
        softDeleteTasks: Effect.fn(
          "@mason/project/ProjectModuleService.softDeleteTasks"
        )(({ workspaceId, projectId, taskIds }) =>
          processArray({
            items: taskIds,
            schema: TaskId,
            onEmpty: Effect.void,
            execute: (nea) =>
              Effect.gen(function* () {
                const existingTasks = yield* taskRepo.list({
                  workspaceId,
                  query: {
                    ids: nea,
                    projectIds: [projectId],
                  },
                });

                const deletedTasks = yield* Effect.forEach(
                  existingTasks,
                  softDeleteTask
                );

                yield* processArray({
                  items: deletedTasks,
                  schema: Task,
                  onEmpty: Effect.void,
                  execute: (nea) => taskRepo.update(nea).pipe(Effect.asVoid),
                });
              }),
          }).pipe(
            Effect.catchTags({
              "@mason/framework/DatabaseError": (e) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
              ParseError: (e) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
            })
          )
        ),
        hardDeleteTasks: Effect.fn(
          "@mason/project/ProjectModuleService.hardDeleteTasks"
        )(({ workspaceId, projectId, taskIds }) =>
          processArray({
            items: taskIds,
            schema: TaskId,
            onEmpty: Effect.void,
            execute: (nea) =>
              Effect.gen(function* () {
                const existingTasks = yield* taskRepo.list({
                  workspaceId,
                  query: {
                    ids: nea,
                    projectIds: [projectId],
                  },
                });

                yield* processArray({
                  items: existingTasks.map((existing) => existing.id),
                  schema: ExistingTaskId,
                  onEmpty: Effect.void,
                  execute: (nea) => taskRepo.hardDelete(nea),
                });
              }),
          }).pipe(
            Effect.catchTags({
              "@mason/framework/DatabaseError": (e) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
              ParseError: (e) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
            })
          )
        ),
        listTasks: Effect.fn("@mason/project/ProjectModuleService.listTasks")(
          ({ workspaceId, projectId, query }) =>
            taskRepo
              .list({
                workspaceId,
                query: {
                  ...query,
                  projectIds: [projectId],
                },
              })
              .pipe(
                Effect.catchTags({
                  "@mason/framework/DatabaseError": (e) =>
                    Effect.fail(new InternalProjectModuleError({ cause: e })),
                })
              )
        ),
      });
    })
  );
}
