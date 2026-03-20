import { User, UserRepository } from "@mason/core/modules/identity";
import { RepositoryError } from "@mason/core/shared/repository";
import { schema } from "@mason/db";
import { eq } from "drizzle-orm";
import { Effect, Layer, Schema } from "effect";
import { SqlSchema } from "effect/unstable/sql";

import { Database } from "@mason/db";

export const UserRepositoryLayer = Layer.effect(
  UserRepository,
  Effect.gen(function* () {
    const { drizzle } = yield* Database;

    const insertUser = SqlSchema.findOne({
      Request: User.insert,
      Result: User,
      execute: (data) =>
        drizzle.insert(schema.usersTable).values(data).returning().execute(),
    });

    const updateUser = SqlSchema.findOne({
      Request: Schema.Struct({
        id: User.fields.id,
        update: User.update,
      }),
      Result: User,
      execute: ({ id, update }) =>
        drizzle
          .update(schema.usersTable)
          .set(update)
          .where(eq(schema.usersTable.id, id))
          .returning()
          .execute(),
    });

    const findUserById = SqlSchema.findOneOption({
      Request: User.fields.id,
      Result: User,
      execute: (id) =>
        drizzle
          .select()
          .from(schema.usersTable)
          .where(eq(schema.usersTable.id, id))
          .execute(),
    });

    const findUserByEmail = SqlSchema.findOneOption({
      Request: User.fields.email,
      Result: User,
      execute: (email) =>
        drizzle
          .select()
          .from(schema.usersTable)
          .where(eq(schema.usersTable.email, email))
          .execute(),
    });

    return {
      insert: (data) =>
        insertUser(data).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
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
