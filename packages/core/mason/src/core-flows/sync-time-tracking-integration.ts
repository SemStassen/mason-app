import { TimeTrackingIntegrationAdapter } from "@mason/adapters";
import { DatabaseService } from "@mason/db/service";
import type { ExistingWorkspaceId } from "@mason/framework";
import {
  IntegrationModuleService,
  WorkspaceIntegrationToUpdateDTO,
} from "@mason/integration";
import {
  ProjectModuleService,
  ProjectToCreateDTO,
  ProjectToUpdateDTO,
  TaskToCreateDTO,
  TaskToUpdateDTO,
} from "@mason/project";
import { DateTime, Effect, Either, Option, Schema } from "effect";
import { InternalError } from "../errors";

export class TaskProjectNotFoundError extends Schema.TaggedError<TaskProjectNotFoundError>()(
  "@mason/core-flows/TaskProjectNotFoundError",
  {
    externalTaskId: Schema.String,
    externalProjectId: Schema.String,
  }
) {}

// ============ Internal sync helpers ============

const syncProjects = ({
  workspaceId,
  kind,
}: {
  workspaceId: ExistingWorkspaceId;
  kind: "float";
}) =>
  Effect.gen(function* () {
    const integrationService = yield* IntegrationModuleService;
    const projectsService = yield* ProjectModuleService;

    const apiKey = yield* integrationService.retrieveWorkspaceApiKey({
      workspaceId,
      kind,
    });

    const externalProjects = yield* Effect.flatMap(
      TimeTrackingIntegrationAdapter,
      (adapter) => adapter.listProjects({ apiKey })
    ).pipe(
      Effect.provide(TimeTrackingIntegrationAdapter.getLayer(kind)),
      Effect.flatMap((projects) =>
        Effect.partition(projects, (p) =>
          Option.match(p.name, {
            onSome: (name) =>
              Either.left({
                externalId: p.externalId,
                name,
                ...Option.match(p.hexColor, {
                  onSome: (hexColor) => ({ hexColor }),
                  onNone: () => ({}),
                }),
                ...Option.match(p.isBillable, {
                  onSome: (isBillable) => ({ isBillable }),
                  onNone: () => ({}),
                }),
                startDate: p.startDate,
                endDate: p.endDate,
                notes: p.notes,
              }),
            onNone: () => Either.right(p),
          })
        )
      ),
      Effect.tap(([valid, invalid]) =>
        Effect.logDebug(
          `Found ${valid.length} valid projects, filtered out ${invalid.length} without names`
        )
      ),
      Effect.map(([valid]) => valid)
    );

    const existingProjects = yield* projectsService.listProjects({
      workspaceId,
      query: { _source: kind },
    });

    const projectsToCreate = externalProjects
      .filter(
        (p) =>
          !existingProjects.some(
            (existing) =>
              Option.getOrUndefined(existing._metadata)?.externalId ===
              p.externalId
          )
      )
      .map((p) =>
        ProjectToCreateDTO.make({
          ...p,
          _metadata: Option.some({ source: kind, externalId: p.externalId }),
        })
      );

    const projectsToUpdate = externalProjects.flatMap((p) => {
      const existing = existingProjects.find(
        (e) => Option.getOrUndefined(e._metadata)?.externalId === p.externalId
      );
      if (!existing) {
        return [];
      }
      return [
        ProjectToUpdateDTO.make({
          ...p,
          id: existing.id,
        }),
      ];
    });

    const projectsToDelete = existingProjects.filter(
      (existing) =>
        !externalProjects.some(
          (p) =>
            p.externalId ===
            Option.getOrUndefined(existing._metadata)?.externalId
        )
    );

    yield* Effect.all([
      projectsService.createProjects({
        workspaceId,
        projects: projectsToCreate,
      }),
      projectsService.updateProjects({
        workspaceId,
        projects: projectsToUpdate,
      }),
      projectsService.softDeleteProjects({
        workspaceId,
        projectIds: projectsToDelete.map((p) => p.id),
      }),
    ]);
  });

const syncTasks = ({
  workspaceId,
  kind,
}: {
  workspaceId: ExistingWorkspaceId;
  kind: "float";
}) =>
  Effect.gen(function* () {
    const integrationService = yield* IntegrationModuleService;
    const projectsService = yield* ProjectModuleService;

    const apiKey = yield* integrationService.retrieveWorkspaceApiKey({
      workspaceId,
      kind,
    });

    const externalTasks = yield* Effect.flatMap(
      TimeTrackingIntegrationAdapter,
      (adapter) => adapter.listTasks({ apiKey })
    ).pipe(
      Effect.provide(TimeTrackingIntegrationAdapter.getLayer(kind)),
      Effect.flatMap((tasks) =>
        Effect.partition(tasks, (t) =>
          Option.match(t.name, {
            onSome: (name) =>
              Either.left({
                externalId: t.externalId,
                externalProjectId: t.externalProjectId,
                name,
              }),
            onNone: () => Either.right(t),
          })
        )
      ),
      Effect.tap(([valid, invalid]) =>
        Effect.logDebug(
          `Found ${valid.length} valid tasks, filtered out ${invalid.length} without names`
        )
      ),
      Effect.map(([valid]) => valid)
    );

    const existingProjects = yield* projectsService.listProjects({
      workspaceId,
      query: {
        _externalIds: Array.from(
          new Set(externalTasks.map((t) => t.externalProjectId))
        ),
      },
    });

    // Query tasks per project (service requires projectId)
    const existingTasks = yield* Effect.flatMap(
      Effect.forEach(existingProjects, (project) =>
        projectsService.listTasks({
          workspaceId,
          projectId: project.id,
          query: { _source: kind },
        })
      ),
      (taskArrays) => Effect.succeed(taskArrays.flat())
    );

    const projectsByExternalId = new Map(
      existingProjects.map((p) => [
        Option.getOrUndefined(p._metadata)?.externalId,
        p,
      ])
    );

    // Group tasks by projectId for batch operations
    const tasksToCreateByProject = yield* Effect.forEach(
      externalTasks.filter(
        (t) =>
          !existingTasks.some(
            (existing) =>
              Option.getOrUndefined(existing._metadata)?.externalId ===
              t.externalId
          )
      ),
      (t) => {
        const project = projectsByExternalId.get(t.externalProjectId);
        if (!project) {
          return Effect.fail(
            new TaskProjectNotFoundError({
              externalTaskId: t.externalId,
              externalProjectId: t.externalProjectId,
            })
          );
        }
        return Effect.succeed({
          projectId: project.id,
          task: TaskToCreateDTO.make({
            ...t,
            _metadata: Option.some({ source: kind, externalId: t.externalId }),
          }),
        });
      }
    );

    const tasksToUpdateByProject = yield* Effect.forEach(
      externalTasks.flatMap((t) => {
        const existing = existingTasks.find(
          (e) => Option.getOrUndefined(e._metadata)?.externalId === t.externalId
        );
        return existing ? [{ external: t, existing }] : [];
      }),
      ({ external, existing }) => {
        const project = projectsByExternalId.get(external.externalProjectId);
        if (!project) {
          return Effect.fail(
            new TaskProjectNotFoundError({
              externalTaskId: external.externalId,
              externalProjectId: external.externalProjectId,
            })
          );
        }
        return Effect.succeed({
          projectId: project.id,
          task: TaskToUpdateDTO.make({
            ...external,
            id: existing.id,
          }),
        });
      }
    );

    const tasksToDelete = existingTasks.filter(
      (existing) =>
        !externalTasks.some(
          (t) =>
            t.externalId ===
            Option.getOrUndefined(existing._metadata)?.externalId
        )
    );

    // Group by projectId for batch service calls
    const createByProject = Map.groupBy(
      tasksToCreateByProject,
      (t) => t.projectId
    );
    const updateByProject = Map.groupBy(
      tasksToUpdateByProject,
      (t) => t.projectId
    );
    const deleteByProject = Map.groupBy(tasksToDelete, (t) => t.projectId);

    yield* Effect.all([
      Effect.forEach(createByProject, ([projectId, tasks]) =>
        projectsService.createTasks({
          workspaceId,
          projectId,
          tasks: tasks.map((t) => t.task),
        })
      ),
      Effect.forEach(updateByProject, ([projectId, tasks]) =>
        projectsService.updateTasks({
          workspaceId,
          projectId,
          tasks: tasks.map((t) => t.task),
        })
      ),
      Effect.forEach(deleteByProject, ([projectId, tasks]) =>
        projectsService.softDeleteTasks({
          workspaceId,
          projectId,
          taskIds: tasks.map((t) => t.id),
        })
      ),
    ]);
  });

// ============ Public core flow ============

export const syncTimeTrackingIntegration: (params: {
  workspaceId: ExistingWorkspaceId;
  kind: "float";
}) => Effect.Effect<
  void,
  InternalError,
  IntegrationModuleService | DatabaseService | ProjectModuleService
> = Effect.fn("@mason/core-flows/syncWorkspaceIntegration")(
  function* (params) {
    const db = yield* DatabaseService;
    const integrationService = yield* IntegrationModuleService;

    const workspaceIntegration =
      yield* integrationService.retrieveWorkspaceIntegration({
        workspaceId: params.workspaceId,
        query: { kind: params.kind },
      });

    const lastSyncedAt = yield* DateTime.now;

    yield* db.withTransaction(
      Effect.gen(function* () {
        yield* syncProjects(params);
        yield* syncTasks(params);
        yield* integrationService.updateWorkspaceIntegration({
          workspaceId: params.workspaceId,
          workspaceIntegration: WorkspaceIntegrationToUpdateDTO.make({
            id: workspaceIntegration.id,
            _metadata: Option.some({
              lastSyncedAt: lastSyncedAt,
            }),
          }),
        });
      })
    );
  },
  Effect.mapError((e) => new InternalError({ cause: e }))
);
