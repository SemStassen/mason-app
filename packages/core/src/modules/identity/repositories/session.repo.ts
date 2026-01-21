import { SqlSchema } from "@effect/sql";
import { DrizzleService, schema } from "@mason/db";
import { and, eq, type SQL } from "drizzle-orm";
import { Context, Effect, Layer, Option, Schema } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/infra/db";
import { wrapSqlError } from "~/infra/db";
import type { SessionId, UserId } from "~/shared/schemas";
import type { AtLeastOne } from "~/shared/utils";
import { Session } from "../domain/session.model";

/**
 * Schema representing a database row from the sessions table.
 * Includes all fields including metadata (createdAt, updatedAt).
 * Note: sessionToken, expiresAt, ipAddress, userAgent are managed by auth system
 * and not part of the domain model.
 */
const SessionDbRow = Schema.Struct({
  id: Schema.String,
  userId: Schema.String,
  sessionToken: Schema.String,
  expiresAt: Schema.Date,
  ipAddress: Schema.String,
  userAgent: Schema.String,
  activeWorkspaceId: Schema.NullOr(Schema.String),
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
});
type SessionDbRow = typeof SessionDbRow.Type;

/**
 * Convert database row to Session domain entity.
 * Pure function - no Effect wrapping needed.
 * Only maps fields that exist in the domain model.
 */
const rowToSession = (row: SessionDbRow): Session =>
  Schema.decodeUnknownSync(Session)({
    id: row.id,
    userId: row.userId,
    activeWorkspaceId: Option.fromNullable(row.activeWorkspaceId),
  });

/**
 * Maps domain model to database format (Option<string> -> string | null).
 * Only updates fields that are part of the domain model.
 */
const sessionToDb = (session: typeof Session.Encoded) => ({
  activeWorkspaceId: Option.getOrNull(session.activeWorkspaceId),
});

export class SessionRepository extends Context.Tag(
  "@mason/identity/SessionRepository"
)<
  SessionRepository,
  {
    update: (params: {
      sessions: NonEmptyReadonlyArray<Session>;
    }) => Effect.Effect<ReadonlyArray<Session>, DatabaseError>;
    retrieve: (params: {
      query: AtLeastOne<{
        id?: SessionId;
        userId?: UserId;
      }>;
    }) => Effect.Effect<Option.Option<Session>, DatabaseError>;
  }
>() {
  static readonly live = Layer.effect(
    SessionRepository,
    Effect.gen(function* () {
      const drizzle = yield* DrizzleService;

      const updateQuery = SqlSchema.findAll({
        Request: Session,
        Result: SessionDbRow,
        execute: (session) =>
          drizzle
            .update(schema.sessionsTable)
            .set(sessionToDb(session))
            .where(eq(schema.sessionsTable.id, session.id))
            .returning()
            .execute(),
      });

      const retrieveQuery = SqlSchema.findOne({
        Request: Schema.Struct({
          id: Schema.optional(Schema.String),
          userId: Schema.optional(Schema.String),
        }),
        Result: SessionDbRow,
        execute: (request) => {
          const whereConditions: Array<SQL> = [];

          if (request.id) {
            whereConditions.push(eq(schema.sessionsTable.id, request.id));
          }

          if (request.userId) {
            whereConditions.push(
              eq(schema.sessionsTable.userId, request.userId)
            );
          }

          return drizzle
            .select()
            .from(schema.sessionsTable)
            .where(
              whereConditions.length > 0 ? and(...whereConditions) : undefined
            )
            .limit(1)
            .execute();
        },
      });

      return SessionRepository.of({
        update: Effect.fn("@mason/identity/SessionRepo.update")(function* ({
          sessions,
        }) {
          const results = yield* Effect.forEach(
            sessions,
            (session) => updateQuery(session),
            { concurrency: 5 }
          );

          return results.flat().map(rowToSession);
        }, wrapSqlError),

        retrieve: Effect.fn("@mason/identity/SessionRepo.retrieve")(function* ({
          query,
        }) {
          const maybeRow = yield* retrieveQuery({ ...query });

          return Option.map(maybeRow, rowToSession);
        }, wrapSqlError),
      });
    })
  );
}
