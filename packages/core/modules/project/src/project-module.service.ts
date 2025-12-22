import type {
  ProjectId,
  TaskId,
  WorkspaceId,
} from "@mason/framework/types/ids";
import { Context, Effect, Layer } from "effect";
import type {
  ProjectToCreate,
  ProjectToUpdate,
  TaskToCreate,
  TaskToUpdate,
} from "./dto";
import { GenericProjectModuleError, type ProjectModuleError } from "./errors";
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
    }) => Effect.Effect<ReadonlyArray<Project>, ProjectModuleError>;
    updateProjects: (params: {
      workspaceId: WorkspaceId;
      projects: Array<ProjectToUpdate>;
    }) => Effect.Effect<ReadonlyArray<Project>, ProjectModuleError>;
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
    }) => Effect.Effect<ReadonlyArray<Project>, ProjectModuleError>;
    createTasks: (params: {
      workspaceId: WorkspaceId;
      tasks: Array<TaskToCreate>;
    }) => Effect.Effect<ReadonlyArray<Task>, ProjectModuleError>;
    updateTasks: (params: {
      workspaceId: WorkspaceId;
      tasks: Array<TaskToUpdate>;
    }) => Effect.Effect<ReadonlyArray<Task>, ProjectModuleError>;
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
    }) => Effect.Effect<ReadonlyArray<Task>, ProjectModuleError>;
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
              Effect.fail(new GenericProjectModuleError({ cause: e })),
            SqlError: (e) =>
              Effect.fail(new GenericProjectModuleError({ cause: e })),
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
                      new GenericProjectModuleError({
                        cause: `Project ${project.id} not found`,
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
              Effect.fail(new GenericProjectModuleError({ cause: e })),
            SqlError: (e) =>
              Effect.fail(new GenericProjectModuleError({ cause: e })),
          })
        ),
        softDeleteProjects: Effect.fn(
          "@mason/project/ProjectModuleService.softDeleteProjects"
        )(function* (params) {
          return yield* projectRepo
            .softDelete(params)
            .pipe(
              Effect.mapError(
                (e) => new GenericProjectModuleError({ cause: e })
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
                (e) => new GenericProjectModuleError({ cause: e })
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
                (e) => new GenericProjectModuleError({ cause: e })
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
              Effect.fail(new GenericProjectModuleError({ cause: e })),
            SqlError: (e) =>
              Effect.fail(new GenericProjectModuleError({ cause: e })),
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
                    new GenericProjectModuleError({
                      cause: `Task ${task.id} not found`,
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
              Effect.fail(new GenericProjectModuleError({ cause: e })),
            SqlError: (e) =>
              Effect.fail(new GenericProjectModuleError({ cause: e })),
          })
        ),
        softDeleteTasks: Effect.fn(
          "@mason/project/ProjectModuleService.softDeleteTasks"
        )((params) =>
          taskRepo
            .softDelete(params)
            .pipe(
              Effect.mapError(
                (e) => new GenericProjectModuleError({ cause: e })
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
                (e) => new GenericProjectModuleError({ cause: e })
              )
            )
        ),
        listTasks: Effect.fn("@mason/project/ProjectModuleService.listTasks")(
          (params) =>
            taskRepo
              .list(params)
              .pipe(
                Effect.mapError(
                  (e) => new GenericProjectModuleError({ cause: e })
                )
              )
        ),
      });
    })
  );
}
