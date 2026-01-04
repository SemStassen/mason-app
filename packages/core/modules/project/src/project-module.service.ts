import {
  type DatabaseError,
  ExistingWorkspaceId,
  ProjectId,
  processArray,
  TaskId,
} from "@mason/framework";
import { Context, Effect, Layer, Option } from "effect";
import type { ParseError } from "effect/ParseResult";
import { Project, Task } from "./domain";
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
import { ProjectRepository } from "./infra/project.repo";
import { TaskRepository } from "./infra/task.repo";

export class ProjectModuleService extends Context.Tag(
  "@mason/project/ProjectModuleService"
)<
  ProjectModuleService,
  {
    createProjects: (params: {
      workspaceId: ExistingWorkspaceId;
      projects: ReadonlyArray<ProjectToCreateDTO>;
    }) => Effect.Effect<
      ReadonlyArray<Project.Project>,
      InternalProjectModuleError
    >;
    updateProjects: (params: {
      workspaceId: ExistingWorkspaceId;
      projects: ReadonlyArray<ProjectToUpdateDTO>;
    }) => Effect.Effect<
      ReadonlyArray<Project.Project>,
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
    }) => Effect.Effect<
      ReadonlyArray<Project.Project>,
      InternalProjectModuleError
    >;
    createTasks: (params: {
      workspaceId: ExistingWorkspaceId;
      projectId: ProjectId;
      tasks: ReadonlyArray<TaskToCreateDTO>;
    }) => Effect.Effect<
      ReadonlyArray<Task.Task>,
      InternalProjectModuleError | ProjectNotFoundError
    >;
    updateTasks: (params: {
      workspaceId: ExistingWorkspaceId;
      projectId: ProjectId;
      tasks: ReadonlyArray<TaskToUpdateDTO>;
    }) => Effect.Effect<
      ReadonlyArray<Task.Task>,
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
    }) => Effect.Effect<ReadonlyArray<Task.Task>, InternalProjectModuleError>;
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
              Effect.forEach(nea, (p) => Project.create(p, workspaceId)).pipe(
                Effect.andThen(projectRepo.insert)
              ),
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
                return yield* Project.update(existing, update);
              }),
            execute: (projectsToUpdate) => projectRepo.update(projectsToUpdate),
          }).pipe(
            Effect.catchTags({
              "@mason/framework/DatabaseError": (e: DatabaseError) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
              ParseError: (e) =>
                Effect.fail(new InternalProjectModuleError({ cause: e })),
            })
          )
        ),
        softDeleteProjects: Effect.fn(
          "@mason/project/ProjectModuleService.softDeleteProjects"
        )(({ workspaceId, projectIds }) =>
          processArray({
            items: projectIds,
            onEmpty: Effect.void,
            execute: (nea) =>
              projectRepo.list({ workspaceId, query: { ids: nea } }).pipe(
                Effect.andThen(Effect.forEach(Project.softDelete)),
                Effect.andThen((deleted) =>
                  processArray({
                    items: deleted,
                    onEmpty: Effect.void,
                    execute: (nea) =>
                      projectRepo.update(nea).pipe(Effect.asVoid),
                  })
                )
              ),
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
                  onEmpty: Effect.void,
                  execute: (nea) => projectRepo.hardDelete(nea),
                });
              }),
          }).pipe(
            Effect.catchTags({
              "@mason/framework/DatabaseError": (e) =>
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
                  Task.create(task, {
                    workspaceId: ExistingWorkspaceId.make(workspaceId),
                    projectId: existingProjectId,
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
                return yield* Task.update(existing, update);
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
            onEmpty: Effect.void,
            execute: (nea) =>
              Effect.gen(function* () {
                const existingTasks = yield* taskRepo.list({
                  workspaceId,
                  query: {
                    ids: nea,
                    ...(projectId && { projectIds: [projectId] }),
                  },
                });

                const deletedTasks = yield* Effect.forEach(
                  existingTasks,
                  Task.softDelete
                );

                yield* processArray({
                  items: deletedTasks,
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
                  onEmpty: Effect.void,
                  execute: (nea) => taskRepo.hardDelete(nea),
                });
              }),
          }).pipe(
            Effect.catchTags({
              "@mason/framework/DatabaseError": (e) =>
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
                  ...(projectId && { projectIds: [projectId] }),
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
