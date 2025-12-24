import {
  ProjectId,
  processArray,
  TaskId,
  type WorkspaceId,
} from "@mason/framework";
import { Context, Effect, Layer } from "effect";
import type {
  ProjectToCreate,
  ProjectToUpdate,
  TaskToCreate,
  TaskToUpdate,
} from "./dto";
import {
  InternalProjectModuleError,
  ProjectNotFoundError,
  TaskNotFoundError,
} from "./errors";
import { Project } from "./models/project.model";
import { Task } from "./models/task.model";
import { ProjectRepository } from "./repositories/project.repo";
import { TaskRepository } from "./repositories/task.repo";

export class ProjectModuleService extends Context.Tag(
  "@mason/project/ProjectModuleService"
)<
  ProjectModuleService,
  {
    createProjects: (params: {
      workspaceId: WorkspaceId;
      projects: ReadonlyArray<ProjectToCreate>;
    }) => Effect.Effect<ReadonlyArray<Project>, InternalProjectModuleError>;
    updateProjects: (params: {
      workspaceId: WorkspaceId;
      projects: ReadonlyArray<ProjectToUpdate>;
    }) => Effect.Effect<
      ReadonlyArray<Project>,
      InternalProjectModuleError | ProjectNotFoundError
    >;
    softDeleteProjects: (params: {
      workspaceId: WorkspaceId;
      projectIds: ReadonlyArray<ProjectId>;
    }) => Effect.Effect<void, InternalProjectModuleError>;
    hardDeleteProjects: (params: {
      workspaceId: WorkspaceId;
      projectIds: ReadonlyArray<ProjectId>;
    }) => Effect.Effect<void, InternalProjectModuleError>;
    listProjects: (params: {
      workspaceId: WorkspaceId;
      query?: {
        ids?: Array<ProjectId>;
        _source?: "float";
        _externalIds?: Array<string>;
      };
    }) => Effect.Effect<ReadonlyArray<Project>, InternalProjectModuleError>;
    createTasks: (params: {
      workspaceId: WorkspaceId;
      projectId: ProjectId;
      tasks: ReadonlyArray<TaskToCreate>;
    }) => Effect.Effect<ReadonlyArray<Task>, InternalProjectModuleError>;
    updateTasks: (params: {
      workspaceId: WorkspaceId;
      projectId: ProjectId;
      tasks: ReadonlyArray<TaskToUpdate>;
    }) => Effect.Effect<
      ReadonlyArray<Task>,
      InternalProjectModuleError | TaskNotFoundError
    >;
    softDeleteTasks: (params: {
      workspaceId: WorkspaceId;
      projectId: ProjectId;
      taskIds: ReadonlyArray<TaskId>;
    }) => Effect.Effect<void, InternalProjectModuleError>;
    hardDeleteTasks: (params: {
      workspaceId: WorkspaceId;
      projectId: ProjectId;
      taskIds: ReadonlyArray<TaskId>;
    }) => Effect.Effect<void, InternalProjectModuleError>;
    listTasks: (params: {
      workspaceId: WorkspaceId;
      projectId: ProjectId;
      query?: {
        ids?: Array<TaskId>;
        _source?: "float";
        _externalIds?: Array<string>;
      };
    }) => Effect.Effect<ReadonlyArray<Task>, InternalProjectModuleError>;
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
                  Project.makeFromCreate(workspaceId, p)
                );

                return yield* projectRepo.insert(projectsToCreate);
              }),
          }).pipe(
            Effect.catchTags({
              ParseError: (e) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
              SqlError: (e) =>
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
                return new Map(existingProjects.map((e) => [e.id, e]));
              }),
            mapItem: (update, existingMap) =>
              Effect.gen(function* () {
                const existing = existingMap.get(update.id);
                if (!existing) {
                  return yield* Effect.fail(
                    new ProjectNotFoundError({ projectId: update.id })
                  );
                }
                return yield* existing.patch(update);
              }),
            execute: (projectsToUpdate) => projectRepo.update(projectsToUpdate),
          }).pipe(
            Effect.catchTags({
              ParseError: (e) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
              SqlError: (e) =>
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

                const deletedProjects = existingProjects.map((existing) =>
                  existing.softDelete()
                );

                yield* processArray({
                  items: deletedProjects,
                  schema: Project,
                  onEmpty: Effect.void,
                  execute: (nea) => projectRepo.update(nea).pipe(Effect.asVoid),
                });
              }),
          }).pipe(
            Effect.catchTags({
              ParseError: (e) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
              SqlError: (e) =>
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
                  schema: ProjectId,
                  onEmpty: Effect.void,
                  execute: (nea) => projectRepo.hardDelete(nea),
                });
              }),
          }).pipe(
            Effect.catchTags({
              ParseError: (e) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
              SqlError: (e) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
            })
          )
        ),
        listProjects: Effect.fn(
          "@mason/project/ProjectModuleService.listProjects"
        )((params) =>
          projectRepo
            .list(params)
            .pipe(
              Effect.mapError(
                (e) => new InternalProjectModuleError({ cause: e })
              )
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
                const tasksToCreate = yield* Effect.forEach(nea, (task) =>
                  Task.makeFromCreate(task, { workspaceId, projectId })
                );

                return yield* taskRepo.insert(tasksToCreate);
              }),
          }).pipe(
            Effect.catchTags({
              ParseError: (e) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
              SqlError: (e) =>
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
                return new Map(existingTasks.map((e) => [e.id, e]));
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
                return yield* existing.patch(update);
              }),
            execute: (tasksToUpdate) => taskRepo.update(tasksToUpdate),
          }).pipe(
            Effect.catchTags({
              ParseError: (e) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
              SqlError: (e) =>
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

                const deletedTasks = existingTasks.map((existing) =>
                  existing.softDelete()
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
              ParseError: (e) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
              SqlError: (e) =>
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
                  schema: TaskId,
                  onEmpty: Effect.void,
                  execute: (nea) => taskRepo.hardDelete(nea),
                });
              }),
          }).pipe(
            Effect.catchTags({
              ParseError: (e) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
              SqlError: (e) =>
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
                Effect.mapError(
                  (e) => new InternalProjectModuleError({ cause: e })
                )
              )
        ),
      });
    })
  );
}
