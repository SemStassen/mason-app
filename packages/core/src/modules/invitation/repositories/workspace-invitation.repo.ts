import { SqlSchema } from "@effect/sql";
import { DrizzleService, schema } from "@mason/db";
import { and, eq, gte, inArray, type SQL } from "drizzle-orm";
import { Context, DateTime, Effect, Layer, Option, Schema } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/infra/db";
import { wrapSqlError } from "~/infra/db";
import type {
  Email,
  WorkspaceId,
  WorkspaceInvitationId,
} from "~/shared/schemas";
import type { AtLeastOne } from "~/shared/utils";
import { WorkspaceInvitation } from "../domain/workspace-invitation.model";

/**
 * Schema representing a database row from the workspace_invitations table.
 * Includes all fields including metadata (createdAt, updatedAt).
 */
const WorkspaceInvitationDbRow = Schema.Struct({
  id: Schema.String,
  inviterId: Schema.String,
  workspaceId: Schema.String,
  email: Schema.String,
  role: Schema.String,
  status: Schema.String,
  expiresAt: Schema.Date,
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
});
type WorkspaceInvitationDbRow = typeof WorkspaceInvitationDbRow.Type;

/**
 * Convert database row to WorkspaceInvitation domain entity.
 * Pure function - no Effect wrapping needed.
 */
const rowToWorkspaceInvitation = (
  row: WorkspaceInvitationDbRow
): WorkspaceInvitation =>
  Schema.decodeUnknownSync(WorkspaceInvitation)({
    id: row.id,
    inviterId: row.inviterId,
    workspaceId: row.workspaceId,
    email: row.email,
    role: row.role,
    status: row.status as WorkspaceInvitation["status"],
    expiresAt: row.expiresAt,
  });

/**
 * Maps domain model to database format (DateTime.Utc -> Date).
 */
const workspaceInvitationToDb = (
  workspaceInvitation: typeof WorkspaceInvitation.Encoded
) => ({
  id: workspaceInvitation.id,
  inviterId: workspaceInvitation.inviterId,
  workspaceId: workspaceInvitation.workspaceId,
  email: workspaceInvitation.email,
  role: workspaceInvitation.role,
  status: workspaceInvitation.status,
  expiresAt: DateTime.toDate(workspaceInvitation.expiresAt),
});

export class WorkspaceInvitationRepository extends Context.Tag(
  "@mason/invitation/WorkspaceInvitationRepository"
)<
  WorkspaceInvitationRepository,
  {
    insert: (params: {
      workspaceInvitations: NonEmptyReadonlyArray<WorkspaceInvitation>;
    }) => Effect.Effect<ReadonlyArray<WorkspaceInvitation>, DatabaseError>;
    update: (params: {
      workspaceId: WorkspaceId;
      workspaceInvitations: NonEmptyReadonlyArray<WorkspaceInvitation>;
    }) => Effect.Effect<ReadonlyArray<WorkspaceInvitation>, DatabaseError>;
    upsert: (params: {
      workspaceId: WorkspaceId;
      workspaceInvitations: NonEmptyReadonlyArray<WorkspaceInvitation>;
    }) => Effect.Effect<ReadonlyArray<WorkspaceInvitation>, DatabaseError>;
    retrieve: (params: {
      query: AtLeastOne<{
        id: WorkspaceInvitationId;
        workspaceId: WorkspaceId;
        status: WorkspaceInvitation["status"];
        email: Email;
        includeExpired: boolean;
      }>;
    }) => Effect.Effect<Option.Option<WorkspaceInvitation>, DatabaseError>;
    list: (params: {
      workspaceId: WorkspaceId;
      query: {
        ids?: ReadonlyArray<WorkspaceInvitationId>;
        status?: WorkspaceInvitation["status"];
        includeExpired?: boolean;
      };
    }) => Effect.Effect<ReadonlyArray<WorkspaceInvitation>, DatabaseError>;
    hardDelete: (params: {
      workspaceId: WorkspaceId;
      workspaceInvitationIds: NonEmptyReadonlyArray<WorkspaceInvitationId>;
    }) => Effect.Effect<void, DatabaseError>;
  }
>() {
  static readonly live = Layer.effect(
    WorkspaceInvitationRepository,
    Effect.gen(function* () {
      const drizzle = yield* DrizzleService;

      const insertQuery = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceInvitations: Schema.Array(WorkspaceInvitation.model),
        }),
        Result: WorkspaceInvitationDbRow,
        execute: (request) =>
          drizzle
            .insert(schema.workspaceInvitationsTable)
            .values(request.workspaceInvitations.map(workspaceInvitationToDb))
            .returning(),
      });

      const updateQuery = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: Schema.String,
          workspaceInvitation: WorkspaceInvitation.model,
        }),
        Result: WorkspaceInvitationDbRow,
        execute: (request) =>
          drizzle
            .update(schema.workspaceInvitationsTable)
            .set(workspaceInvitationToDb(request.workspaceInvitation))
            .where(
              and(
                eq(
                  schema.workspaceInvitationsTable.id,
                  request.workspaceInvitation.id
                ),
                eq(
                  schema.workspaceInvitationsTable.workspaceId,
                  request.workspaceId
                )
              )
            )
            .returning(),
      });

      const upsertQuery = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: Schema.String,
          workspaceInvitation: WorkspaceInvitation.model,
        }),
        Result: WorkspaceInvitationDbRow,
        execute: (request) =>
          drizzle
            .insert(schema.workspaceInvitationsTable)
            .values(workspaceInvitationToDb(request.workspaceInvitation))
            .onConflictDoUpdate({
              targetWhere: eq(
                schema.workspaceInvitationsTable.workspaceId,
                request.workspaceId
              ),
              target: [
                schema.workspaceInvitationsTable.workspaceId,
                schema.workspaceInvitationsTable.email,
              ],
              set: {
                inviterId: schema.workspaceInvitationsTable.inviterId,
                role: schema.workspaceInvitationsTable.role,
                status: schema.workspaceInvitationsTable.status,
                expiresAt: schema.workspaceInvitationsTable.expiresAt,
                updatedAt: new Date(),
              },
            })
            .returning(),
      });

      const retrieveQuery = SqlSchema.findOne({
        Request: Schema.Struct({
          id: Schema.optional(Schema.String),
          workspaceId: Schema.optional(Schema.String),
          status: Schema.optional(Schema.String),
          email: Schema.optional(Schema.String),
          includeExpired: Schema.Boolean,
        }),
        Result: WorkspaceInvitationDbRow,
        execute: (request) => {
          const whereConditions: Array<SQL> = [];

          if (request.id) {
            whereConditions.push(
              eq(schema.workspaceInvitationsTable.id, request.id)
            );
          }

          if (request.workspaceId) {
            whereConditions.push(
              eq(
                schema.workspaceInvitationsTable.workspaceId,
                request.workspaceId
              )
            );
          }

          if (request.status) {
            whereConditions.push(
              eq(schema.workspaceInvitationsTable.status, request.status)
            );
          }

          if (request.email) {
            whereConditions.push(
              eq(schema.workspaceInvitationsTable.email, request.email)
            );
          }

          if (!request.includeExpired) {
            const now = new Date();
            whereConditions.push(
              gte(schema.workspaceInvitationsTable.expiresAt, now)
            );
          }

          return drizzle
            .select()
            .from(schema.workspaceInvitationsTable)
            .where(
              whereConditions.length > 0 ? and(...whereConditions) : undefined
            )
            .limit(1);
        },
      });

      const listQuery = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: Schema.String,
          ids: Schema.optional(Schema.Array(Schema.String)),
          status: Schema.optional(Schema.String),
          includeExpired: Schema.optional(Schema.Boolean),
        }),
        Result: WorkspaceInvitationDbRow,
        execute: (request) => {
          const whereConditions: Array<SQL> = [
            eq(
              schema.workspaceInvitationsTable.workspaceId,
              request.workspaceId
            ),
          ];

          if (request.ids && request.ids.length > 0) {
            whereConditions.push(
              inArray(schema.workspaceInvitationsTable.id, request.ids)
            );
          }

          if (request.status) {
            whereConditions.push(
              eq(schema.workspaceInvitationsTable.status, request.status)
            );
          }

          if (!request.includeExpired) {
            const now = new Date();
            whereConditions.push(
              gte(schema.workspaceInvitationsTable.expiresAt, now)
            );
          }

          return drizzle
            .select()
            .from(schema.workspaceInvitationsTable)
            .where(and(...whereConditions));
        },
      });

      const hardDeleteQuery = SqlSchema.void({
        Request: Schema.Struct({
          workspaceId: Schema.String,
          workspaceInvitationIds: Schema.Array(Schema.String),
        }),
        execute: (request) =>
          drizzle
            .delete(schema.workspaceInvitationsTable)
            .where(
              and(
                eq(
                  schema.workspaceInvitationsTable.workspaceId,
                  request.workspaceId
                ),
                inArray(
                  schema.workspaceInvitationsTable.id,
                  request.workspaceInvitationIds
                )
              )
            ),
      });

      return WorkspaceInvitationRepository.of({
        insert: Effect.fn("@mason/invitation/WorkspaceInvitationRepo.insert")(
          function* ({ workspaceInvitations }) {
            const rows = yield* insertQuery({ workspaceInvitations });

            return rows.map(rowToWorkspaceInvitation);
          },
          wrapSqlError
        ),

        update: Effect.fn("@mason/invitation/WorkspaceInvitationRepo.update")(
          function* ({ workspaceId, workspaceInvitations }) {
            const results = yield* Effect.forEach(
              workspaceInvitations,
              (workspaceInvitation) =>
                updateQuery({ workspaceId, workspaceInvitation }),
              { concurrency: 5 }
            );

            return results.flat().map(rowToWorkspaceInvitation);
          },
          wrapSqlError
        ),

        upsert: Effect.fn("@mason/invitation/WorkspaceInvitationRepo.upsert")(
          function* ({ workspaceId, workspaceInvitations }) {
            const results = yield* Effect.forEach(
              workspaceInvitations,
              (workspaceInvitation) =>
                upsertQuery({ workspaceId, workspaceInvitation }),
              { concurrency: 5 }
            );

            return results.flat().map(rowToWorkspaceInvitation);
          },
          wrapSqlError
        ),

        retrieve: Effect.fn(
          "@mason/invitation/WorkspaceInvitationRepo.retrieve"
        )(function* ({ query }) {
          const maybeRow = yield* retrieveQuery({
            id: query.id,
            workspaceId: query.workspaceId,
            status: query.status,
            email: query.email,
            includeExpired: query.includeExpired ?? false,
          });

          return Option.map(maybeRow, rowToWorkspaceInvitation);
        }, wrapSqlError),

        list: Effect.fn("@mason/invitation/WorkspaceInvitationRepo.list")(
          function* ({ workspaceId, query }) {
            const rows = yield* listQuery({
              workspaceId,
              ids: query.ids,
              status: query.status,
              includeExpired: query.includeExpired,
            });

            return rows.map(rowToWorkspaceInvitation);
          },
          wrapSqlError
        ),

        hardDelete: Effect.fn(
          "@mason/invitation/WorkspaceInvitationRepo.hardDelete"
        )(function* ({ workspaceId, workspaceInvitationIds }) {
          return yield* hardDeleteQuery({
            workspaceId,
            workspaceInvitationIds: workspaceInvitationIds,
          });
        }, wrapSqlError),
      });
    })
  );
}
