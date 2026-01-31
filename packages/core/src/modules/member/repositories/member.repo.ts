import { SqlSchema } from "@effect/sql";
import { DrizzleService, schema } from "@mason/db";
import { and, eq, type SQL } from "drizzle-orm";
import { Context, DateTime, Effect, Layer, Option, Schema } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/infra/db";
import { wrapSqlError } from "~/infra/db";
import type { MemberId, UserId, WorkspaceId } from "~/shared/schemas";
import type { AtLeastOne } from "~/shared/utils";
import { Member } from "../domain/member.model";

/**
 * Schema representing a database row from the members table.
 * Includes all fields including metadata (createdAt, updatedAt, deletedAt).
 */
const MemberDbRow = Schema.Struct({
  id: Schema.String,
  userId: Schema.String,
  workspaceId: Schema.String,
  role: Schema.String,
  deletedAt: Schema.NullOr(Schema.Date),
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
});
type MemberDbRow = typeof MemberDbRow.Type;

/**
 * Convert database row to Member domain entity.
 * Pure function - no Effect wrapping needed.
 */
const rowToMember = (row: MemberDbRow): Member =>
  Schema.decodeUnknownSync(Member)({
    id: row.id,
    userId: row.userId,
    workspaceId: row.workspaceId,
    role: row.role,
    deletedAt: Option.fromNullable(row.deletedAt),
  });

/**
 * Maps domain model to database format (Option<DateTime.Utc> -> Date | null).
 */
const memberToDb = (member: typeof Member.Encoded) => ({
  id: member.id,
  userId: member.userId,
  workspaceId: member.workspaceId,
  role: member.role,
  deletedAt: Option.getOrNull(Option.map(member.deletedAt, DateTime.toDate)),
});

export class MemberRepository extends Context.Tag(
  "@mason/member/MemberRepository"
)<
  MemberRepository,
  {
    insert: (params: {
      members: NonEmptyReadonlyArray<Member>;
    }) => Effect.Effect<ReadonlyArray<Member>, DatabaseError>;
    update: (params: {
      workspaceId: WorkspaceId;
      members: NonEmptyReadonlyArray<Member>;
    }) => Effect.Effect<ReadonlyArray<Member>, DatabaseError>;
    retrieve: (params: {
      workspaceId: WorkspaceId;
      query: AtLeastOne<{
        id?: MemberId;
        userId?: UserId;
      }>;
    }) => Effect.Effect<Option.Option<Member>, DatabaseError>;
  }
>() {
  static readonly live = Layer.effect(
    MemberRepository,
    Effect.gen(function* () {
      const drizzle = yield* DrizzleService;

      const insertQuery = SqlSchema.findAll({
        Request: Schema.Struct({
          members: Schema.Array(Member.model),
        }),
        Result: MemberDbRow,
        execute: (request) =>
          drizzle
            .insert(schema.membersTable)
            .values(request.members.map(memberToDb))
            .returning(),
      });

      const updateQuery = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: Schema.String,
          member: Member.model,
        }),
        Result: MemberDbRow,
        execute: (request) =>
          drizzle
            .update(schema.membersTable)
            .set(memberToDb(request.member))
            .where(
              and(
                eq(schema.membersTable.id, request.member.id),
                eq(schema.membersTable.workspaceId, request.workspaceId)
              )
            )
            .returning(),
      });

      const retrieveQuery = SqlSchema.findOne({
        Request: Schema.Struct({
          workspaceId: Schema.String,
          id: Schema.optional(Schema.String),
          userId: Schema.optional(Schema.String),
        }),
        Result: MemberDbRow,
        execute: (request) => {
          const whereConditions: Array<SQL> = [
            eq(schema.membersTable.workspaceId, request.workspaceId),
          ];

          if (request.id) {
            whereConditions.push(eq(schema.membersTable.id, request.id));
          }

          if (request.userId) {
            whereConditions.push(
              eq(schema.membersTable.userId, request.userId)
            );
          }

          return drizzle
            .select()
            .from(schema.membersTable)
            .where(and(...whereConditions))
            .limit(1);
        },
      });

      return MemberRepository.of({
        insert: Effect.fn("@mason/member/MemberRepo.insert")(function* ({
          members,
        }) {
          const rows = yield* insertQuery({ members });

          return rows.map(rowToMember);
        }, wrapSqlError),

        update: Effect.fn("@mason/member/MemberRepo.update")(function* ({
          workspaceId,
          members,
        }) {
          const results = yield* Effect.forEach(
            members,
            (member) => updateQuery({ workspaceId, member }),
            { concurrency: 5 }
          );

          return results.flat().map(rowToMember);
        }, wrapSqlError),

        retrieve: Effect.fn("@mason/member/MemberRepo.retrieve")(function* ({
          workspaceId,
          query,
        }) {
          const maybeRow = yield* retrieveQuery({ workspaceId, ...query });

          return Option.map(maybeRow, rowToMember);
        }, wrapSqlError),
      });
    })
  );
}
