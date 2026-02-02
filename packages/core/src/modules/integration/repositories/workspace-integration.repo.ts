import { SqlSchema } from "@effect/sql";
import { DrizzleService, schema } from "@mason/db";
import { and, eq, inArray, type SQL } from "drizzle-orm";
import { Context, Effect, Layer, Option, Schema } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/infra/db";
import { wrapSqlError } from "~/infra/db";
import { WorkspaceId, type WorkspaceIntegrationId } from "~/shared/schemas";
import type { AtLeastOne } from "~/shared/utils";
import { WorkspaceIntegration } from "../domain/workspace-integration.model";

/**
 * Schema representing a database row from the workspace_integrations table.
 * Includes all fields including metadata (createdAt, updatedAt).
 */
const WorkspaceIntegrationDbRow = Schema.Struct({
  id: Schema.String,
  workspaceId: Schema.String,
  createdByMemberId: Schema.NullOr(Schema.String),
  provider: Schema.String,
  encryptedApiKey: Schema.String,
  _metadata: Schema.NullOr(
    Schema.Record({ key: Schema.String, value: Schema.Unknown })
  ),
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
});
type WorkspaceIntegrationDbRow = typeof WorkspaceIntegrationDbRow.Type;

/**
 * Convert database row to WorkspaceIntegration domain entity.
 * Pure function - no Effect wrapping needed.
 */
const rowToWorkspaceIntegration = (
  row: WorkspaceIntegrationDbRow
): WorkspaceIntegration =>
  Schema.decodeUnknownSync(WorkspaceIntegration)({
    id: row.id,
    workspaceId: row.workspaceId,
    createdByMemberId: row.createdByMemberId,
    provider: row.provider,
    apiKey: row.encryptedApiKey,
    _metadata: Option.fromNullable(row._metadata),
    createdAt: row.createdAt,
  });

/**
 * Maps domain model to database format (Option<T> -> T | null).
 */
const workspaceIntegrationToDb = (
  workspaceIntegration: typeof WorkspaceIntegration.Encoded
) => ({
  id: workspaceIntegration.id,
  workspaceId: workspaceIntegration.workspaceId,
  createdByMemberId: workspaceIntegration.createdByMemberId,
  provider: workspaceIntegration.provider,
  encryptedApiKey: workspaceIntegration.apiKey,
  _metadata: Option.getOrNull(workspaceIntegration._metadata),
});

export class WorkspaceIntegrationRepository extends Context.Tag(
  "@mason/integration/WorkspaceIntegrationRepository"
)<
  WorkspaceIntegrationRepository,
  {
    insert: (params: {
      workspaceIntegrations: NonEmptyReadonlyArray<WorkspaceIntegration>;
    }) => Effect.Effect<ReadonlyArray<WorkspaceIntegration>, DatabaseError>;
    update: (params: {
      workspaceId: WorkspaceId;
      workspaceIntegrations: NonEmptyReadonlyArray<WorkspaceIntegration>;
    }) => Effect.Effect<ReadonlyArray<WorkspaceIntegration>, DatabaseError>;
    retrieve: (params: {
      workspaceId: WorkspaceId;
      query: AtLeastOne<{
        id?: WorkspaceIntegrationId;
        provider?: WorkspaceIntegration["provider"];
      }>;
    }) => Effect.Effect<Option.Option<WorkspaceIntegration>, DatabaseError>;
    list: (params: {
      workspaceId: WorkspaceId;
      query: {
        ids?: ReadonlyArray<WorkspaceIntegrationId>;
      };
    }) => Effect.Effect<ReadonlyArray<WorkspaceIntegration>, DatabaseError>;
    hardDelete: (params: {
      workspaceId: WorkspaceId;
      ids: NonEmptyReadonlyArray<WorkspaceIntegrationId>;
    }) => Effect.Effect<void, DatabaseError>;
  }
>() {
  static readonly live = Layer.effect(
    WorkspaceIntegrationRepository,
    Effect.gen(function* () {
      const drizzle = yield* DrizzleService;

      const insertQuery = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceIntegrations: Schema.Array(WorkspaceIntegration.model),
        }),
        Result: WorkspaceIntegrationDbRow,
        execute: (request) =>
          drizzle
            .insert(schema.workspaceIntegrationsTable)
            .values(request.workspaceIntegrations.map(workspaceIntegrationToDb))
            .returning(),
      });

      const updateQuery = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: WorkspaceId,
          workspaceIntegration: WorkspaceIntegration.model,
        }),
        Result: WorkspaceIntegrationDbRow,
        execute: (request) =>
          drizzle
            .update(schema.workspaceIntegrationsTable)
            .set(workspaceIntegrationToDb(request.workspaceIntegration))
            .where(
              and(
                eq(
                  schema.workspaceIntegrationsTable.id,
                  request.workspaceIntegration.id
                ),
                eq(
                  schema.workspaceIntegrationsTable.workspaceId,
                  request.workspaceId
                )
              )
            )
            .returning(),
      });

      const retrieveQuery = SqlSchema.findOne({
        Request: Schema.Struct({
          workspaceId: Schema.String,
          id: Schema.optional(Schema.String),
          provider: Schema.optional(Schema.String),
        }),
        Result: WorkspaceIntegrationDbRow,
        execute: (request) => {
          const whereConditions: Array<SQL> = [
            eq(
              schema.workspaceIntegrationsTable.workspaceId,
              request.workspaceId
            ),
          ];

          if (request.id) {
            whereConditions.push(
              eq(schema.workspaceIntegrationsTable.id, request.id)
            );
          }

          if (request.provider) {
            whereConditions.push(
              eq(schema.workspaceIntegrationsTable.provider, request.provider)
            );
          }

          return drizzle
            .select()
            .from(schema.workspaceIntegrationsTable)
            .where(and(...whereConditions))
            .limit(1);
        },
      });

      const listQuery = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: Schema.String,
          ids: Schema.optional(Schema.Array(Schema.String)),
        }),
        Result: WorkspaceIntegrationDbRow,
        execute: (request) => {
          const whereConditions: Array<SQL> = [
            eq(
              schema.workspaceIntegrationsTable.workspaceId,
              request.workspaceId
            ),
          ];

          if (request.ids && request.ids.length > 0) {
            whereConditions.push(
              inArray(schema.workspaceIntegrationsTable.id, request.ids)
            );
          }

          return drizzle
            .select()
            .from(schema.workspaceIntegrationsTable)
            .where(and(...whereConditions));
        },
      });

      const hardDeleteQuery = SqlSchema.void({
        Request: Schema.Struct({
          workspaceId: Schema.String,
          ids: Schema.Array(Schema.String),
        }),
        execute: (request) =>
          drizzle
            .delete(schema.workspaceIntegrationsTable)
            .where(
              and(
                eq(
                  schema.workspaceIntegrationsTable.workspaceId,
                  request.workspaceId
                ),
                inArray(schema.workspaceIntegrationsTable.id, request.ids)
              )
            ),
      });

      return WorkspaceIntegrationRepository.of({
        insert: Effect.fn("@mason/integration/WorkspaceIntegrationRepo.insert")(
          function* ({ workspaceIntegrations }) {
            const rows = yield* insertQuery({ workspaceIntegrations });

            return rows.map(rowToWorkspaceIntegration);
          },
          wrapSqlError
        ),

        update: Effect.fn("@mason/integration/WorkspaceIntegrationRepo.update")(
          function* ({ workspaceId, workspaceIntegrations }) {
            const results = yield* Effect.forEach(
              workspaceIntegrations,
              (workspaceIntegration) =>
                updateQuery({ workspaceId, workspaceIntegration }),
              { concurrency: 5 }
            );

            return results.flat().map(rowToWorkspaceIntegration);
          },
          wrapSqlError
        ),

        retrieve: Effect.fn(
          "@mason/integration/WorkspaceIntegrationRepo.retrieve"
        )(function* ({ workspaceId, query }) {
          const maybeRow = yield* retrieveQuery({
            workspaceId,
            ...query,
          });

          return Option.map(maybeRow, rowToWorkspaceIntegration);
        }, wrapSqlError),

        list: Effect.fn("@mason/integration/WorkspaceIntegrationRepo.list")(
          function* ({ workspaceId, query }) {
            const rows = yield* listQuery({
              workspaceId,
              ids: query.ids,
            });

            return rows.map(rowToWorkspaceIntegration);
          },
          wrapSqlError
        ),

        hardDelete: Effect.fn(
          "@mason/integration/WorkspaceIntegrationRepo.hardDelete"
        )(function* ({ workspaceId, ids }) {
          return yield* hardDeleteQuery({
            workspaceId,
            ids: ids,
          });
        }, wrapSqlError),
      });
    })
  );
}
