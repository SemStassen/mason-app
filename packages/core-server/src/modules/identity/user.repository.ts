import { User, UserRepository } from "@mason/core/modules/identity";
import { RepositoryError } from "@mason/core/shared/repository";
import { Database, schema } from "@mason/db";
import { eq } from "drizzle-orm";
import { Effect, Layer, Schema } from "effect";
import { SqlSchema } from "effect/unstable/sql";

export const UserRepositoryLayer = Layer.effect(
  UserRepository,
  Effect.gen(function* () {
    const db = yield* Database;

    const insertUser = SqlSchema.findOne({
      Request: User.insert,
      Result: User,
      execute: (data) =>
        db.drizzle((drizzle) =>
          drizzle
            .insert(schema.usersTable)
            .values(data)
            .returning()
            .execute()
        ),
    });

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
