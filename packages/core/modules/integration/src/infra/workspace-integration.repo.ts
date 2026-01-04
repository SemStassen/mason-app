import { SqlSchema } from "@effect/sql";
import { and, eq, inArray } from "@mason/db/operators";
import {
  type DbWorkspaceIntegration,
  workspaceIntegrationsTable,
} from "@mason/db/schema";
import { DatabaseService } from "@mason/db/service";
import {
  DatabaseError,
  ExistingWorkspaceId,
  ExistingWorkspaceIntegrationId,
  WorkspaceIntegrationId,
} from "@mason/framework";
import { Context, Effect, Layer, Option, Schema } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import { WorkspaceIntegration } from "../domain/workspace-integration/model";

const _mapToDb = (
  workspaceIntegration: typeof WorkspaceIntegration.Encoded
): Omit<DbWorkspaceIntegration, "createdAt" | "updatedAt"> => {
  return {
    id: workspaceIntegration.id,
    workspaceId: workspaceIntegration.workspaceId,
    createdByMemberId: workspaceIntegration.createdByMemberId,
    kind: workspaceIntegration.kind,
    encryptedApiKey: workspaceIntegration.encryptedApiKey,
    _metadata: Option.getOrNull(workspaceIntegration._metadata),
  };
};

export class WorkspaceIntegrationRepository extends Context.Tag(
  "@mason/integration/WorkspaceIntegrationRepository"
)<
  WorkspaceIntegrationRepository,
  {
    insert: (
      workspaceIntegrations: NonEmptyReadonlyArray<WorkspaceIntegration>
    ) => Effect.Effect<ReadonlyArray<WorkspaceIntegration>, DatabaseError>;
    update: (
      workspaceIntegrations: NonEmptyReadonlyArray<WorkspaceIntegration>
    ) => Effect.Effect<ReadonlyArray<WorkspaceIntegration>, DatabaseError>;
    hardDelete: (
      workspaceIntegrationsIds: NonEmptyReadonlyArray<ExistingWorkspaceIntegrationId>
    ) => Effect.Effect<void, DatabaseError>;
    list: (params: {
      workspaceId: ExistingWorkspaceId;
      query?: {
        ids?: ReadonlyArray<WorkspaceIntegrationId>;
      };
    }) => Effect.Effect<ReadonlyArray<WorkspaceIntegration>, DatabaseError>;
    retrieve: (params: {
      workspaceId: ExistingWorkspaceId;
      query?: {
        id?: WorkspaceIntegrationId;
        kind?: "float";
      };
    }) => Effect.Effect<Option.Option<WorkspaceIntegration>, DatabaseError>;
  }
>() {
  static readonly live = Layer.effect(
    WorkspaceIntegrationRepository,
    Effect.gen(function* () {
      const db = yield* DatabaseService;

      // --- Mutations / Commands ---
      const InsertWorkspaceIntegrations = SqlSchema.findAll({
        Request: Schema.NonEmptyArray(WorkspaceIntegration),
        Result: WorkspaceIntegration,
        execute: (workspaceIntegrations) =>
          db.drizzle
            .insert(workspaceIntegrationsTable)
            .values(workspaceIntegrations.map(_mapToDb))
            .returning(),
      });

      const UpdateWorkspaceIntegrations = SqlSchema.findAll({
        Request: Schema.NonEmptyArray(WorkspaceIntegration),
        Result: WorkspaceIntegration,
        execute: (workspaceIntegrations) =>
          Effect.forEach(
            workspaceIntegrations,
            (workspaceIntegration) =>
              db.drizzle
                .update(workspaceIntegrationsTable)
                .set(_mapToDb(workspaceIntegration))
                .where(
                  eq(workspaceIntegrationsTable.id, workspaceIntegration.id)
                )
                .returning(),
            { concurrency: 5 }
          ),
      });

      const HardDeleteWorkspaceIntegrations = SqlSchema.void({
        Request: Schema.NonEmptyArray(ExistingWorkspaceIntegrationId),
        execute: (workspaceIntegrationIds) =>
          db.drizzle
            .delete(workspaceIntegrationsTable)
            .where(
              inArray(workspaceIntegrationsTable.id, workspaceIntegrationIds)
            ),
      });

      // --- Queries ---
      const ListWorkspaceIntegrations = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: ExistingWorkspaceId,
          query: Schema.optional(
            Schema.Struct({
              ids: Schema.optional(Schema.Array(WorkspaceIntegrationId)),
            })
          ),
        }),
        Result: WorkspaceIntegration,
        execute: ({ workspaceId, query }) =>
          Effect.gen(function* () {
            const whereConditions = [
              eq(workspaceIntegrationsTable.workspaceId, workspaceId),
              query?.ids
                ? inArray(workspaceIntegrationsTable.id, query.ids)
                : undefined,
            ].filter(Boolean);

            return yield* db.drizzle.query.workspaceIntegrationsTable.findMany({
              where: and(...whereConditions),
            });
          }),
      });

      const RetrieveWorkspaceIntegration = SqlSchema.findOne({
        Request: Schema.Struct({
          workspaceId: ExistingWorkspaceId,
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
        insert: Effect.fn("@mason/integration/WorkspaceIntegrationRepo.insert")(
          (workspaceIntegrations) =>
            InsertWorkspaceIntegrations(workspaceIntegrations).pipe(
              Effect.mapError((e) => new DatabaseError({ cause: e }))
            )
        ),
        update: Effect.fn("@mason/integration/WorkspaceIntegrationRepo.update")(
          (workspaceIntegrations) =>
            UpdateWorkspaceIntegrations(workspaceIntegrations).pipe(
              Effect.mapError((e) => new DatabaseError({ cause: e }))
            )
        ),
        hardDelete: Effect.fn(
          "@mason/integration/WorkspaceIntegrationRepo.hardDelete"
        )((workspaceIntegrationIds) =>
          HardDeleteWorkspaceIntegrations(workspaceIntegrationIds).pipe(
            Effect.mapError((e) => new DatabaseError({ cause: e }))
          )
        ),
        list: Effect.fn("@mason/integration/WorkspaceIntegrationRepo.list")(
          (params) =>
            ListWorkspaceIntegrations(params).pipe(
              Effect.mapError((e) => new DatabaseError({ cause: e }))
            )
        ),
        retrieve: Effect.fn(
          "@mason/integration/WorkspaceIntegrationRepo.retrieve"
        )((params) =>
          RetrieveWorkspaceIntegration(params).pipe(
            Effect.mapError((e) => new DatabaseError({ cause: e }))
          )
        ),
      });
    })
  );
}
