import type { ProjectId, TaskId, WorkspaceId } from "@mason/framework/types";
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
      projects: Array<ProjectToCreate>;
    }) => Effect.Effect<ReadonlyArray<Project>, InternalProjectModuleError>;
    updateProjects: (params: {
      workspaceId: WorkspaceId;
      projects: Array<ProjectToUpdate>;
    }) => Effect.Effect<
      ReadonlyArray<Project>,
      InternalProjectModuleError | ProjectNotFoundError
    >;
    softDeleteProjects: (params: {
      workspaceId: WorkspaceId;
      projectIds: Array<ProjectId>;
    }) => Effect.Effect<void, InternalProjectModuleError>;
    hardDeleteProjects: (params: {
      workspaceId: WorkspaceId;
      projectIds: Array<ProjectId>;
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
      tasks: Array<TaskToCreate>;
    }) => Effect.Effect<ReadonlyArray<Task>, InternalProjectModuleError>;
    updateTasks: (params: {
      workspaceId: WorkspaceId;
      tasks: Array<TaskToUpdate>;
    }) => Effect.Effect<
      ReadonlyArray<Task>,
      InternalProjectModuleError | TaskNotFoundError
    >;
    softDeleteTasks: (params: {
      workspaceId: WorkspaceId;
      taskIds: Array<TaskId>;
    }) => Effect.Effect<void, InternalProjectModuleError>;
    hardDeleteTasks: (params: {
      workspaceId: WorkspaceId;
      taskIds: Array<TaskId>;
    }) => Effect.Effect<void, InternalProjectModuleError>;
    listTasks: (params: {
      workspaceId: WorkspaceId;
      query?: {
        ids?: Array<TaskId>;
        projectIds?: Array<ProjectId>;
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
        )(
          function* ({ workspaceId, projects }) {
            const projectsToCreate = yield* Effect.forEach(
              projects,
              (project) => Project.makeFromCreate(project, workspaceId)
            );

            return yield* projectRepo.insert({
              workspaceId: workspaceId,
              projects: projectsToCreate,
            });
          },
          Effect.catchTags({
            ParseError: (e) =>
              Effect.fail(new InternalProjectModuleError({ cause: e })),
            SqlError: (e) =>
              Effect.fail(new InternalProjectModuleError({ cause: e })),
          })
        ),
        updateProjects: Effect.fn(
          "@mason/project/ProjectModuleService.updateProjects"
        )(
          function* ({ workspaceId, projects }) {
            const existingProjects = yield* projectRepo.list({
              workspaceId: workspaceId,
              query: {
                ids: projects.map((project) => project.id),
              },
            });

            const projectsToUpdate = yield* Effect.forEach(
              projects,
              (project) =>
                Effect.gen(function* () {
                  const existingProject = existingProjects.find(
                    (p) => p.id === project.id
                  );
                  if (!existingProject) {
                    return yield* Effect.fail(
                      new ProjectNotFoundError({
                        projectId: project.id,
                      })
                    );
                  }
                  return yield* existingProject.patch(project);
                })
            );

            return yield* projectRepo.update({
              workspaceId: workspaceId,
              projects: projectsToUpdate,
            });
          },
          Effect.catchTags({
            ParseError: (e) =>
              Effect.fail(new InternalProjectModuleError({ cause: e })),
            SqlError: (e) =>
              Effect.fail(new InternalProjectModuleError({ cause: e })),
          })
        ),
        softDeleteProjects: Effect.fn(
          "@mason/project/ProjectModuleService.softDeleteProjects"
        )(function* (params) {
          return yield* projectRepo
            .softDelete(params)
            .pipe(
              Effect.mapError(
                (e) => new InternalProjectModuleError({ cause: e })
              )
            );
        }),
        hardDeleteProjects: Effect.fn(
          "@mason/project/ProjectModuleService.hardDeleteProjects"
        )((params) =>
          projectRepo
            .hardDelete(params)
            .pipe(
              Effect.mapError(
                (e) => new InternalProjectModuleError({ cause: e })
              )
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
        )(
          function* ({ workspaceId, tasks }) {
            const tasksToCreate = yield* Effect.forEach(tasks, (task) =>
              Task.makeFromCreate(task, workspaceId)
            );

            return yield* taskRepo.insert({
              workspaceId: workspaceId,
              tasks: tasksToCreate,
            });
          },
          Effect.catchTags({
            ParseError: (e) =>
              Effect.fail(new InternalProjectModuleError({ cause: e })),
            SqlError: (e) =>
              Effect.fail(new InternalProjectModuleError({ cause: e })),
          })
        ),
        updateTasks: Effect.fn(
          "@mason/project/ProjectModuleService.updateTasks"
        )(
          function* ({ workspaceId, tasks }) {
            const existingTasks = yield* taskRepo.list({
              workspaceId: workspaceId,
              query: {
                ids: tasks.map((task) => task.id),
              },
            });

            const tasksToUpdate = yield* Effect.forEach(tasks, (task) =>
              Effect.gen(function* () {
                const existingTask = existingTasks.find(
                  (t) => t.id === task.id
                );
                if (!existingTask) {
                  return yield* Effect.fail(
                    new TaskNotFoundError({
                      taskId: task.id,
                    })
                  );
                }
                return yield* existingTask.patch(task);
              })
            );

            return yield* taskRepo.update({
              workspaceId: workspaceId,
              tasks: tasksToUpdate,
            });
          },
          Effect.catchTags({
            ParseError: (e) =>
              Effect.fail(new InternalProjectModuleError({ cause: e })),
            SqlError: (e) =>
              Effect.fail(new InternalProjectModuleError({ cause: e })),
          })
        ),
        softDeleteTasks: Effect.fn(
          "@mason/project/ProjectModuleService.softDeleteTasks"
        )((params) =>
          taskRepo
            .softDelete(params)
            .pipe(
              Effect.mapError(
                (e) => new InternalProjectModuleError({ cause: e })
              )
            )
        ),
        hardDeleteTasks: Effect.fn(
          "@mason/project/ProjectModuleService.hardDeleteTasks"
        )((params) =>
          taskRepo
            .hardDelete(params)
            .pipe(
              Effect.mapError(
                (e) => new InternalProjectModuleError({ cause: e })
              )
            )
        ),
        listTasks: Effect.fn("@mason/project/ProjectModuleService.listTasks")(
          (params) =>
            taskRepo
              .list(params)
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
