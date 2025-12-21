import { ProjectId, TaskId, type WorkspaceId } from "@mason/mason/models/ids";
import {
  ProjectToCreate,
  ProjectToUpdate,
} from "@mason/mason/models/project.model";
import { TaskToCreate, TaskToUpdate } from "@mason/mason/models/task.model";
import { WorkspaceIntegrationToUpdate } from "@mason/mason/models/workspace-integration.model";
import { DatabaseService } from "@mason/mason/services/db.service";
import { ProjectsService } from "@mason/mason/services/projects.service";
import { TasksService } from "@mason/mason/services/task.service";
import {
  WorkspaceIntegrationNotFoundError,
  WorkspaceIntegrationsService,
} from "@mason/mason/services/workspace-integrations.service";
import { TimeTrackingIntegrationAdapter } from "@mason/integrations";
import { Effect, Either, Option, Schema } from "effect";

export class TaskProjectNotFoundError extends Schema.TaggedError<TaskProjectNotFoundError>()(
  "@mason/use-cases/taskProjectNotFoundError",
  {
    externalTaskId: Schema.String,
    externalProjectId: Schema.String,
  }
) {}


export const syncIntegrationProjectsUseCase = Effect.fn("syncIntegrationProjectsUseCase")(function* ({
  workspaceId,
  kind,
}: {
  workspaceId: typeof WorkspaceId.Type;
  kind: "float";
}) {
  return yield* Effect.gen(function* () {
    const db = yield* DatabaseService;
    const projectsService = yield* ProjectsService;
    const integrationService = yield* TimeTrackingIntegrationAdapter;

    const externalProjects = yield* integrationService
      .listProjects({
        workspaceId: workspaceId,
      })
      .pipe(
        Effect.flatMap((projects) =>
          Effect.partition(projects, (p) =>
            Option.match(p.name, {
              onSome: (n) => Either.left({ ...p, name: n }),
              onNone: () => Either.right(p),
            })
          )
        ),
        Effect.tap(([validProjects, invalidProjects]) =>
          Effect.logDebug(
            `Found ${validProjects.length} valid projects, filtered out ${invalidProjects.length} projects without names`
          )
        ),
        Effect.map(([validProjects]) => validProjects)
      );

    const existingProjects = yield* projectsService.listProjects({
      workspaceId: workspaceId,
      query: {
        _source: kind,
      },
    });

    const projectsToCreate = externalProjects
      .filter(
        (p) =>
          !existingProjects.some(
            (existing) => existing._metadata?.externalId === p.externalId
          )
      )
      .map((p) =>
        ProjectToCreate.make({
          ...p,
          _metadata: {
            source: kind,
            externalId: p.externalId,
          },
        })
      );

    const projectsToUpdate = externalProjects.flatMap((p) => {
      const existing = existingProjects.find(
        (e) => e._metadata?.externalId === p.externalId
      );

      if (!existing) {
        return [];
      }

      return [
        ProjectToUpdate.make({
          ...p,
          id: existing.id,
        }),
      ];
    });

    const projectsToDelete = existingProjects.filter(
      (existing) =>
        !externalProjects.some(
          (p) => p.externalId === existing._metadata?.externalId
        )
    );

    yield* db.withTransaction(
      Effect.all([
        projectsService.createProjects({
          workspaceId: workspaceId,
          projects: projectsToCreate,
        }),
        projectsService.updateProjects({
          workspaceId: workspaceId,
          projects: projectsToUpdate,
        }),
        projectsService.softDeleteProjects({
          workspaceId: workspaceId,
          projectIds: projectsToDelete.map((p) => ProjectId.make(p.id)),
        }),
      ])
    );
  }).pipe(Effect.provide(TimeTrackingIntegrationAdapter.getLayer(kind)))
});

export const syncIntegrationTasksUseCase = Effect.fn("syncIntegrationTasksUseCase")(function* ({
  workspaceId,
  kind,
}: {
  workspaceId: typeof WorkspaceId.Type;
  kind: "float";
}) {
  return yield* Effect.gen(function* () {
    const db = yield* DatabaseService;
    const tasksService = yield* TasksService;
    const projectsService = yield* ProjectsService;
    const integrationService = yield* TimeTrackingIntegrationAdapter;

    const externalTasks = yield* integrationService
      .listTasks({
        workspaceId: workspaceId,
      })
      .pipe(
        Effect.flatMap((tasks) =>
          Effect.partition(tasks, (t) =>
            Option.match(t.name, {
              onSome: (n) => Either.left({ ...t, name: n }),
              onNone: () => Either.right(t),
            })
          )
        ),
        Effect.tap(([validTasks, invalidTasks]) =>
          Effect.logDebug(
            `Found ${validTasks.length} valid tasks, filtered out ${invalidTasks.length} tasks without names`
          )
        ),
        Effect.map(([validTasks]) => validTasks)
      );

    const existingProjects = yield* projectsService.listProjects({
      workspaceId: workspaceId,
      query: {
        _externalIds: Array.from(
          new Set(externalTasks.map((t) => t.externalProjectId))
        ),
      },
    });

    const existingTasks = yield* tasksService.listTasks({
      workspaceId: workspaceId,
      query: {
        _source: kind,
      },
    });

    const projectsByExternalId = new Map(
      existingProjects.map((p) => [p._metadata?.externalId, p])
    );

    const tasksToCreate = externalTasks
      .filter(
        (t) =>
          !existingTasks.some(
            (existing) => existing._metadata?.externalId === t.externalId
          )
      )
      .map((t) => {
        const project = projectsByExternalId.get(t.externalProjectId);

        if (!project) {
          throw new TaskProjectNotFoundError({
            externalTaskId: t.externalId,
            externalProjectId: t.externalProjectId,
          });
        }

        return TaskToCreate.make({
          ...t,
          projectId: project.id,
          _metadata: {
            source: kind,
            externalId: t.externalId,
          },
        });
      });

    const tasksToUpdate = externalTasks.flatMap((t) => {
      const existing = existingTasks.find(
        (e) => e._metadata?.externalId === t.externalId
      );

      if (!existing) {
        return [];
      }

      const project = projectsByExternalId.get(t.externalProjectId);

      if (!project) {
        throw new TaskProjectNotFoundError({
          externalTaskId: t.externalId,
          externalProjectId: t.externalProjectId,
        });
      }

      return [
        TaskToUpdate.make({
          ...t,
          id: existing.id,
          projectId: project.id,
        }),
      ];
    });

    const tasksToDelete = existingTasks.filter(
      (existing) =>
        !externalTasks.some(
          (t) => t.externalId === existing._metadata?.externalId
        )
    );

    yield* db.withTransaction(
      Effect.all([
        tasksService.createTasks({
          workspaceId: workspaceId,
          tasks: tasksToCreate,
        }),
        tasksService.updateTasks({
          workspaceId: workspaceId,
          tasks: tasksToUpdate,
        }),
        tasksService.softDeleteTasks({
          workspaceId: workspaceId,
          taskIds: tasksToDelete.map((t) => TaskId.make(t.id)),
        }),
      ])
    );
  }).pipe(Effect.provide(TimeTrackingIntegrationAdapter.getLayer(kind)))
});

export const syncIntegrationUseCase = Effect.fn("syncIntegrationUseCase")(function* ({
  workspaceId,
  kind,
}: {
  workspaceId: typeof WorkspaceId.Type;
  kind: "float";
}) {
  return yield* Effect.gen(function* () {
    const db = yield* DatabaseService;
    const workspaceIntegrationsService = yield* WorkspaceIntegrationsService;

    const workspaceIntegration = yield* workspaceIntegrationsService
      .retrieveWorkspaceIntegration({
        workspaceId: workspaceId,
        kind: kind,
      })
      .pipe(
        Effect.flatMap(
          Option.match({
            onNone: () => Effect.fail(new WorkspaceIntegrationNotFoundError()),
            onSome: (integration) => Effect.succeed(integration),
          })
        )
      );

    yield* db.withTransaction(
      Effect.gen(function* () {
        yield* syncIntegrationProjectsUseCase({
          workspaceId: workspaceId,
          kind: kind,
        });
        yield* syncIntegrationTasksUseCase({
          workspaceId: workspaceId,
          kind: kind,
        });
        yield* workspaceIntegrationsService.updateWorkspaceIntegration({
          workspaceId: workspaceId,
          workspaceIntegration: WorkspaceIntegrationToUpdate.make({
            id: workspaceIntegration.id,
            _metadata: {
              lastSyncedAt: new Date(),
            },
          }),
        });
      })
    );
  });
});
