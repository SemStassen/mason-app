import { Effect, Layer, Option } from "effect";
import * as projectTransitions from "./domain/project.transitions";
import * as taskTransitions from "./domain/task.transitions";
import { ProjectRepository } from "./project.repository";
import {
  ProjectModule,
  ProjectNotFoundError,
  TaskNotFoundError,
} from "./project.service";
import { TaskRepository } from "./task.repository";

export const ProjectModuleLayer = Layer.effect(
  ProjectModule,
  Effect.gen(function* () {
    const projectRepo = yield* ProjectRepository;
    const taskRepo = yield* TaskRepository;

    return {
      createProjects: Effect.fn("project.createProjects")(function* (params) {
        if (params.data.length === 0) {
          return [];
        }

        const projects = yield* Effect.forEach(params.data, (data) =>
          Effect.fromResult(
            projectTransitions.createProject({
              workspaceId: params.workspaceId,
              data,
            })
          )
        );

        const persistedProjects = yield* projectRepo.insertMany(projects);

        return persistedProjects;
      }),
      updateProject: Effect.fn("project.updateProject")(function* (params) {
        const project = yield* projectRepo
          .findById({ workspaceId: params.workspaceId, id: params.id })
          .pipe(
            Effect.flatMap(
              Option.match({
                onNone: () =>
                  Effect.fail(
                    new ProjectNotFoundError({ projectId: params.id })
                  ),
                onSome: Effect.succeed,
              })
            )
          );

        const { entity, changes } = yield* Effect.fromResult(
          projectTransitions.updateProject({
            project,
            data: params.data,
          })
        );

        const persistedProject = yield* projectRepo.update({
          id: entity.id,
          workspaceId: entity.workspaceId,
          update: changes,
        });

        return persistedProject;
      }),
      archiveProject: Effect.fn("project.archiveProject")(function* (params) {
        const project = yield* projectRepo
          .findById({ workspaceId: params.workspaceId, id: params.id })
          .pipe(
            Effect.flatMap(
              Option.match({
                onNone: () =>
                  Effect.fail(
                    new ProjectNotFoundError({ projectId: params.id })
                  ),
                onSome: Effect.succeed,
              })
            )
          );

        yield* projectRepo.archive({
          workspaceId: params.workspaceId,
          projectIds: [project.id],
        });
      }),
      restoreProject: Effect.fn("project.restoreProject")(function* (params) {
        const project = yield* projectRepo
          .findById({ workspaceId: params.workspaceId, id: params.id })
          .pipe(
            Effect.flatMap(
              Option.match({
                onNone: () =>
                  Effect.fail(
                    new ProjectNotFoundError({ projectId: params.id })
                  ),
                onSome: Effect.succeed,
              })
            )
          );

        yield* projectRepo.restore({
          workspaceId: params.workspaceId,
          projectIds: [project.id],
        });
      }),
      createTasks: Effect.fn("project.createTasks")(function* (params) {
        if (params.data.length === 0) {
          return [];
        }

        const projectIds = [...new Set(params.data.map((d) => d.projectId))];
        const projects = yield* projectRepo.findManyByIds({
          workspaceId: params.workspaceId,
          ids: projectIds,
        });

        const missingProjectId = projectIds.find(
          (id) => !projects.some((p) => p.id === id)
        );

        if (missingProjectId) {
          return yield* new ProjectNotFoundError({
            projectId: missingProjectId,
          });
        }

        yield* Effect.forEach(projects, (project) =>
          Effect.fromResult(
            projectTransitions.ensureProjectNotArchived(project)
          )
        );

        const tasks = yield* Effect.forEach(params.data, (data) =>
          Effect.fromResult(
            taskTransitions.createTask({
              workspaceId: params.workspaceId,
              data,
            })
          )
        );

        const persistedTasks = yield* taskRepo.insertMany(tasks);

        return persistedTasks;
      }),
      updateTask: Effect.fn("project.updateTask")(function* (params) {
        const task = yield* taskRepo
          .findById({ workspaceId: params.workspaceId, id: params.id })
          .pipe(
            Effect.flatMap(
              Option.match({
                onNone: () =>
                  Effect.fail(new TaskNotFoundError({ taskId: params.id })),
                onSome: Effect.succeed,
              })
            )
          );

        const project = yield* projectRepo
          .findById({ workspaceId: params.workspaceId, id: task.projectId })
          .pipe(
            Effect.flatMap(
              Option.match({
                onNone: () =>
                  Effect.fail(
                    new ProjectNotFoundError({ projectId: task.projectId })
                  ),
                onSome: Effect.succeed,
              })
            )
          );

        yield* Effect.fromResult(
          projectTransitions.ensureProjectNotArchived(project)
        );

        const { entity, changes } = yield* Effect.fromResult(
          taskTransitions.updateTask({ task, data: params.data })
        );

        const persistedTask = yield* taskRepo.update({
          id: entity.id,
          workspaceId: entity.workspaceId,
          update: changes,
        });

        return persistedTask;
      }),
      archiveTask: Effect.fn("project.archiveTask")(function* (params) {
        const task = yield* taskRepo
          .findById({ workspaceId: params.workspaceId, id: params.id })
          .pipe(
            Effect.flatMap(
              Option.match({
                onNone: () =>
                  Effect.fail(new TaskNotFoundError({ taskId: params.id })),
                onSome: Effect.succeed,
              })
            )
          );

        const project = yield* projectRepo
          .findById({ workspaceId: params.workspaceId, id: task.projectId })
          .pipe(
            Effect.flatMap(
              Option.match({
                onNone: () =>
                  Effect.fail(
                    new ProjectNotFoundError({ projectId: task.projectId })
                  ),
                onSome: Effect.succeed,
              })
            )
          );

        yield* Effect.fromResult(
          projectTransitions.ensureProjectNotArchived(project)
        );

        yield* taskRepo.archive({
          workspaceId: params.workspaceId,
          timeEntryIds: [task.id],
        });
      }),
      restoreTask: Effect.fn("project.restoreTask")(function* (params) {
        const task = yield* taskRepo
          .findById({ workspaceId: params.workspaceId, id: params.id })
          .pipe(
            Effect.flatMap(
              Option.match({
                onNone: () =>
                  Effect.fail(new TaskNotFoundError({ taskId: params.id })),
                onSome: Effect.succeed,
              })
            )
          );

        const project = yield* projectRepo
          .findById({ workspaceId: params.workspaceId, id: task.projectId })
          .pipe(
            Effect.flatMap(
              Option.match({
                onNone: () =>
                  Effect.fail(
                    new ProjectNotFoundError({ projectId: task.projectId })
                  ),
                onSome: Effect.succeed,
              })
            )
          );

        yield* Effect.fromResult(
          projectTransitions.ensureProjectNotArchived(project)
        );

        yield* taskRepo.restore({
          workspaceId: params.workspaceId,
          projectIds: [task.id],
        });
      }),
    };
  })
);
