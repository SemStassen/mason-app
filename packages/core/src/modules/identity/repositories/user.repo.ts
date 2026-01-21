import { SqlSchema } from "@effect/sql";
import { DrizzleService, schema } from "@mason/db";
import { and, eq, inArray, type SQL } from "drizzle-orm";
import { Context, Effect, Layer, Option, Schema } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/infra/db";
import { wrapSqlError } from "~/infra/db";
import type { UserId } from "~/shared/schemas";
import type { AtLeastOne } from "~/shared/utils";
import { User } from "../domain/user.model";

/**
 * Schema representing a database row from the users table.
 * Includes all fields including metadata (createdAt, updatedAt).
 */
const UserDbRow = Schema.Struct({
  id: Schema.String,
  displayName: Schema.String,
  email: Schema.String,
  emailVerified: Schema.Boolean,
  imageUrl: Schema.NullOr(Schema.String),
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
});
type UserDbRow = typeof UserDbRow.Type;

/**
 * Convert database row to User domain entity.
 * Pure function - no Effect wrapping needed.
 */
const rowToUser = (row: UserDbRow): User =>
  Schema.decodeUnknownSync(User)({
    id: row.id,
    displayName: row.displayName,
    email: row.email,
    emailVerified: row.emailVerified,
    imageUrl: Option.fromNullable(row.imageUrl),
  });

/**
 * Maps domain model to database format (Option<string> -> string | null).
 */
const userToDb = (user: typeof User.Encoded) => ({
  id: user.id,
  displayName: user.displayName,
  email: user.email,
  emailVerified: user.emailVerified,
  imageUrl: Option.getOrNull(user.imageUrl),
});

export class UserRepository extends Context.Tag(
  "@mason/identity/UserRepository"
)<
  UserRepository,
  {
    insert: (params: {
      users: NonEmptyReadonlyArray<User>;
    }) => Effect.Effect<ReadonlyArray<User>, DatabaseError>;
    update: (params: {
      users: NonEmptyReadonlyArray<User>;
    }) => Effect.Effect<ReadonlyArray<User>, DatabaseError>;
    retrieve: (params: {
      query: AtLeastOne<{
        id?: UserId;
        email?: User["email"];
      }>;
    }) => Effect.Effect<Option.Option<User>, DatabaseError>;
    hardDelete: (params: {
      userIds: NonEmptyReadonlyArray<UserId>;
    }) => Effect.Effect<void, DatabaseError>;
  }
>() {
  static readonly live = Layer.effect(
    UserRepository,
    Effect.gen(function* () {
      const drizzle = yield* DrizzleService;

      const insertQuery = SqlSchema.findAll({
        Request: Schema.Struct({ users: Schema.Array(User) }),
        Result: UserDbRow,
        execute: (request) =>
          drizzle.use((d) =>
            d
              .insert(schema.usersTable)
              .values(request.users.map(userToDb))
              .returning()
          ),
      });

      const updateQuery = SqlSchema.findAll({
        Request: Schema.Struct({ user: User.model }),
        Result: UserDbRow,
        execute: (request) =>
          drizzle.use((d) =>
            d
              .update(schema.usersTable)
              .set(userToDb(request.user))
              .where(eq(schema.usersTable.id, request.user.id))
              .returning()
          ),
      });

      const retrieveQuery = SqlSchema.findOne({
        Request: Schema.Struct({
          id: Schema.optional(Schema.String),
          email: Schema.optional(Schema.String),
        }),
        Result: UserDbRow,
        execute: (request) => {
          const whereConditions: Array<SQL> = [];

          if (request.id) {
            whereConditions.push(eq(schema.usersTable.id, request.id));
          }

          if (request.email) {
            whereConditions.push(eq(schema.usersTable.email, request.email));
          }

          return drizzle.use((d) =>
            d
              .select()
              .from(schema.usersTable)
              .where(
                whereConditions.length > 0 ? and(...whereConditions) : undefined
              )
              .limit(1)
          );
        },
      });

      const hardDeleteQuery = SqlSchema.void({
        Request: Schema.Struct({
          userIds: Schema.Array(Schema.String),
        }),
        execute: (request) =>
          drizzle.use((d) =>
            d
              .delete(schema.usersTable)
              .where(inArray(schema.usersTable.id, request.userIds))
          ),
      });

      return UserRepository.of({
        insert: Effect.fn("@mason/identity/UserRepo.insert")(function* ({
          users,
        }) {
          const rows = yield* insertQuery({ users });

          return rows.map(rowToUser);
        }, wrapSqlError),

        update: Effect.fn("@mason/identity/UserRepo.update")(function* ({
          users,
        }) {
          const results = yield* Effect.forEach(
            users,
            (user) => updateQuery({ user }),
            { concurrency: 5 }
          );

          return results.flat().map(rowToUser);
        }, wrapSqlError),

        retrieve: Effect.fn("@mason/identity/UserRepo.retrieve")(function* ({
          query,
        }) {
          const maybeRow = yield* retrieveQuery({ ...query });

          return Option.map(maybeRow, rowToUser);
        }, wrapSqlError),

        hardDelete: Effect.fn("@mason/identity/UserRepo.hardDelete")(
          function* ({ userIds }) {
            return yield* hardDeleteQuery({ userIds: userIds });
          },
          wrapSqlError
        ),
      });
    })
  );
}
