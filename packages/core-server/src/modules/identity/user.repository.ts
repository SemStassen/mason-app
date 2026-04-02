import { User, UserRepository } from "@recount/core/modules/identity";
import { RepositoryError } from "@recount/core/shared/repository";
import { Database, schema } from "@recount/db";
import { eq } from "drizzle-orm";
import { Effect, Layer, Schema } from "effect";
import { SqlSchema } from "effect/unstable/sql";

export const UserRepositoryLayer = Layer.effect(
  UserRepository,
  Effect.gen(function* () {
    const db = yield* Database;

    const updateUser = SqlSchema.findOne({
      Request: Schema.Struct({
        id: User.fields.id,
        update: User.update,
      }),
      Result: User,
      execute: ({ id, update }) =>
        db.drizzle((drizzle) =>
          drizzle
            .update(schema.usersTable)
            .set(update)
            .where(eq(schema.usersTable.id, id))
            .returning()
            .execute()
        ),
    });

    const findUserById = SqlSchema.findOneOption({
      Request: User.fields.id,
      Result: User,
      execute: (id) =>
        db.drizzle((drizzle) =>
          drizzle
            .select()
            .from(schema.usersTable)
            .where(eq(schema.usersTable.id, id))
            .execute()
        ),
    });

    const findUserByEmail = SqlSchema.findOneOption({
      Request: User.fields.email,
      Result: User,
      execute: (email) =>
        db.drizzle((drizzle) =>
          drizzle
            .select()
            .from(schema.usersTable)
            .where(eq(schema.usersTable.email, email))
            .execute()
        ),
    });

    return {
      update: (params) =>
        updateUser(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findById: (id) =>
        findUserById(id).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findByEmail: (email) =>
        findUserByEmail(email).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
    };
  })
);
