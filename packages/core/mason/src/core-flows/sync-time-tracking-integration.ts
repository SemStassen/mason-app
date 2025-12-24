import { TimeTrackingIntegrationAdapter } from "@mason/adapters";
import { DatabaseService } from "@mason/db/service";
import { ProjectId, TaskId, type WorkspaceId } from "@mason/framework";
import {
  IntegrationService,
  WorkspaceIntegrationToUpdate,
} from "@mason/integration";
import {
  ProjectModuleService,
  ProjectToCreate,
  ProjectToUpdate,
  TaskToCreate,
  TaskToUpdate,
} from "@mason/project";
import { Effect, Either, Option, Schema } from "effect";
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
  workspaceId: WorkspaceId;
  kind: "float";
}) =>
  Effect.gen(function* () {
    const integrationService = yield* IntegrationService;
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
            onSome: (n) => Either.left({ ...p, name: n }),
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
            (existing) => existing._metadata?.externalId === p.externalId
          )
      )
      .map((p) =>
        ProjectToCreate.make({
          ...p,
          _metadata: { source: kind, externalId: p.externalId },
        })
      );

    const projectsToUpdate = externalProjects.flatMap((p) => {
      const existing = existingProjects.find(
        (e) => e._metadata?.externalId === p.externalId
      );
      if (!existing) {
        return [];
      }
      return [ProjectToUpdate.make({ ...p, id: existing.id })];
    });

    const projectsToDelete = existingProjects.filter(
      (existing) =>
        !externalProjects.some(
          (p) => p.externalId === existing._metadata?.externalId
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
        projectIds: projectsToDelete.map((p) => ProjectId.make(p.id)),
      }),
    ]);
  });

const syncTasks = ({
  workspaceId,
  kind,
}: {
  workspaceId: WorkspaceId;
  kind: "float";
}) =>
  Effect.gen(function* () {
    const integrationService = yield* IntegrationService;
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
            onSome: (n) => Either.left({ ...t, name: n }),
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

    const existingTasks = yield* projectsService.listTasks({
      workspaceId,
      query: { _source: kind },
    });

    const projectsByExternalId = new Map(
      existingProjects.map((p) => [p._metadata?.externalId, p])
    );

    // Use Effect.forEach to handle potential failures properly
    const tasksToCreate = yield* Effect.forEach(
      externalTasks.filter(
        (t) =>
          !existingTasks.some(
            (existing) => existing._metadata?.externalId === t.externalId
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
        return Effect.succeed(
          TaskToCreate.make({
            ...t,
            projectId: project.id,
            _metadata: { source: kind, externalId: t.externalId },
          })
        );
      }
    );

    const tasksToUpdate = yield* Effect.forEach(
      externalTasks.flatMap((t) => {
        const existing = existingTasks.find(
          (e) => e._metadata?.externalId === t.externalId
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
        return Effect.succeed(
          TaskToUpdate.make({
            ...external,
            id: existing.id,
          })
        );
      }
    );

    const tasksToDelete = existingTasks.filter(
      (existing) =>
        !externalTasks.some(
          (t) => t.externalId === existing._metadata?.externalId
        )
    );

    yield* Effect.all([
      projectsService.createTasks({ workspaceId, tasks: tasksToCreate }),
      projectsService.updateTasks({ workspaceId, tasks: tasksToUpdate }),
      projectsService.softDeleteTasks({
        workspaceId,
        taskIds: tasksToDelete.map((t) => TaskId.make(t.id)),
      }),
    ]);
  });

// ============ Public core flow ============

export const syncTimeTrackingIntegration: (params: {
  workspaceId: WorkspaceId;
  kind: "float";
}) => Effect.Effect<
  void,
  InternalError,
  IntegrationService | DatabaseService | ProjectModuleService
> = Effect.fn("@mason/core-flows/syncWorkspaceIntegration")(
  function* (params: { workspaceId: WorkspaceId; kind: "float" }) {
    const db = yield* DatabaseService;
    const integrationService = yield* IntegrationService;

    const workspaceIntegration =
      yield* integrationService.retrieveWorkspaceIntegration({
        workspaceId: params.workspaceId,
        query: { kind: params.kind },
      });

    yield* db.withTransaction(
      Effect.gen(function* () {
        yield* syncProjects(params);
        yield* syncTasks(params);
        yield* integrationService.updateWorkspaceIntegrations({
          workspaceId: params.workspaceId,
          workspaceIntegrations: [
            WorkspaceIntegrationToUpdate.make({
              id: workspaceIntegration.id,
              _metadata: { lastSyncedAt: new Date() },
            }),
          ],
        });
      })
    );
  },
  Effect.mapError((e) => new InternalError({ cause: e }))
);
