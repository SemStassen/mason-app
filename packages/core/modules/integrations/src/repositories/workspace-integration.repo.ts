import { SqlSchema } from "@effect/sql";
import { and, eq, inArray } from "@mason/db/operators";
import { workspaceIntegrationsTable } from "@mason/db/schema";
import { DatabaseService } from "@mason/db/service";
import type { RepositoryError } from "@mason/framework/errors/database";
import {
  WorkspaceId,
  WorkspaceIntegrationId,
} from "@mason/framework/types/ids";
import { Context, Effect, Layer, type Option, Schema } from "effect";
import { WorkspaceIntegration } from "../models/workspace-integration.model";

export class WorkspaceIntegrationRepository extends Context.Tag(
  "@mason/integrations/WorkspaceIntegrationRepository"
)<
  WorkspaceIntegrationRepository,
  {
    insert: (params: {
      workspaceId: WorkspaceId;
      workspaceIntegrations: Array<WorkspaceIntegration>;
    }) => Effect.Effect<ReadonlyArray<WorkspaceIntegration>, RepositoryError>;
    update: (params: {
      workspaceId: WorkspaceId;
      workspaceIntegrations: Array<WorkspaceIntegration>;
    }) => Effect.Effect<ReadonlyArray<WorkspaceIntegration>, RepositoryError>;
    hardDelete: (params: {
      workspaceId: WorkspaceId;
      workspaceIntegrationIds: Array<WorkspaceIntegrationId>;
    }) => Effect.Effect<void, RepositoryError>;
    list: (params: {
      workspaceId: WorkspaceId;
    }) => Effect.Effect<ReadonlyArray<WorkspaceIntegration>, RepositoryError>;
    retrieve: (params: {
      workspaceId: WorkspaceId;
      query?: {
        id?: WorkspaceIntegrationId;
        kind?: "float";
      };
    }) => Effect.Effect<Option.Option<WorkspaceIntegration>, RepositoryError>;
  }
>() {
  static readonly live = Layer.effect(
    WorkspaceIntegrationRepository,
    Effect.gen(function* () {
      const db = yield* DatabaseService;

      // --- Mutations / Commands ---
      const InsertWorkspaceIntegrations = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: WorkspaceId,
          workspaceIntegrations: Schema.Array(WorkspaceIntegration),
        }),
        Result: WorkspaceIntegration,
        execute: ({ workspaceId, workspaceIntegrations }) =>
          db.drizzle
            .insert(workspaceIntegrationsTable)
            .values(
              workspaceIntegrations.map((workspaceIntegration) => ({
                ...workspaceIntegration,
                workspaceId,
              }))
            )
            .returning(),
      });

      const UpdateWorkspaceIntegrations = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: WorkspaceId,
          workspaceIntegrations: Schema.Array(WorkspaceIntegration),
        }),
        Result: WorkspaceIntegration,
        execute: ({ workspaceId, workspaceIntegrations }) =>
          Effect.forEach(
            workspaceIntegrations,
            (workspaceIntegration) =>
              db.drizzle
                .update(workspaceIntegrationsTable)
                .set(workspaceIntegration)
                .where(
                  and(
                    eq(workspaceIntegrationsTable.workspaceId, workspaceId),
                    eq(workspaceIntegrationsTable.id, workspaceIntegration.id)
                  )
                )
                .returning(),
            { concurrency: 5 }
          ),
      });

      const HardDeleteWorkspaceIntegrations = SqlSchema.void({
        Request: Schema.Struct({
          workspaceId: WorkspaceId,
          workspaceIntegrationIds: Schema.Array(WorkspaceIntegrationId),
        }),
        execute: ({ workspaceId, workspaceIntegrationIds }) =>
          db.drizzle
            .delete(workspaceIntegrationsTable)
            .where(
              and(
                eq(workspaceIntegrationsTable.workspaceId, workspaceId),
                inArray(workspaceIntegrationsTable.id, workspaceIntegrationIds)
              )
            ),
      });

      // --- Queries ---
      const ListWorkspaceIntegrations = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: WorkspaceId,
        }),
        Result: WorkspaceIntegration,
        execute: ({ workspaceId }) =>
          db.drizzle.query.workspaceIntegrationsTable.findMany({
            where: eq(workspaceIntegrationsTable.workspaceId, workspaceId),
          }),
      });

      const RetrieveWorkspaceIntegration = SqlSchema.findOne({
        Request: Schema.Struct({
          workspaceId: WorkspaceId,
          query: Schema.optional(
            Schema.Struct({
              id: Schema.optional(WorkspaceIntegrationId),
              kind: Schema.optional(Schema.Literal("float")),
            })
          ),
        }),
        Result: WorkspaceIntegration,
        execute: ({ workspaceId, query }) =>
          Effect.gen(function* () {
            const whereConditions = [
              eq(workspaceIntegrationsTable.workspaceId, workspaceId),
              query?.id
                ? eq(workspaceIntegrationsTable.id, query.id)
                : undefined,
              query?.kind
                ? eq(workspaceIntegrationsTable.kind, query.kind)
                : undefined,
            ].filter(Boolean);

            return yield* db.drizzle.query.workspaceIntegrationsTable.findMany({
              where: and(...whereConditions),
              limit: 1,
            });
          }),
      });

      return WorkspaceIntegrationRepository.of({
        insert: Effect.fn("@mason/framework/WorkspaceIntegrationRepo.insert")(
          ({ workspaceId, workspaceIntegrations }) =>
            db.withWorkspace(
              workspaceId,
              InsertWorkspaceIntegrations({
                workspaceId,
                workspaceIntegrations,
              })
            )
        ),
        update: Effect.fn("@mason/framework/WorkspaceIntegrationRepo.update")(
          ({ workspaceId, workspaceIntegrations }) =>
            db.withWorkspace(
              workspaceId,
              UpdateWorkspaceIntegrations({
                workspaceId,
                workspaceIntegrations,
              })
            )
        ),
        hardDelete: Effect.fn(
          "@mason/framework/WorkspaceIntegrationRepo.hardDelete"
        )(({ workspaceId, workspaceIntegrationIds }) =>
          db.withWorkspace(
            workspaceId,
            HardDeleteWorkspaceIntegrations({
              workspaceId,
              workspaceIntegrationIds,
            })
          )
        ),
        list: Effect.fn("@mason/framework/WorkspaceIntegrationRepo.list")(
          ({ workspaceId }) =>
            db.withWorkspace(
              workspaceId,
              ListWorkspaceIntegrations({ workspaceId })
            )
        ),
        retrieve: Effect.fn(
          "@mason/framework/WorkspaceIntegrationRepo.retrieve"
        )(({ workspaceId, query }) =>
          db.withWorkspace(
            workspaceId,
            RetrieveWorkspaceIntegration({
              workspaceId,
              query,
            })
          )
        ),
      });
    })
  );
}
