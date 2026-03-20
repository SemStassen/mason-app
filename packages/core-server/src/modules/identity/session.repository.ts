import { Session, SessionRepository } from "@mason/core/modules/identity";
import { RepositoryError } from "@mason/core/shared/repository";
import { schema } from "@mason/db";
import { eq } from "drizzle-orm";
import { Effect, Layer, Schema } from "effect";
import { SqlSchema } from "effect/unstable/sql";

import { Database } from "@mason/db";

export const SessionRepositoryLayer = Layer.effect(
  SessionRepository,
  Effect.gen(function* () {
    const { drizzle } = yield* Database;

    const updateSession = SqlSchema.findOne({
      Request: Schema.Struct({
        id: Session.fields.id,
        update: Session.update,
      }),
      Result: Session,
      execute: ({ id, update }) =>
        drizzle
          .update(schema.sessionsTable)
          .set(update)
          .where(eq(schema.sessionsTable.id, id))
          .returning()
          .execute(),
    });

    const findSessionById = SqlSchema.findOneOption({
      Request: Session.fields.id,
      Result: Session,
      execute: (id) =>
        drizzle
          .select()
          .from(schema.sessionsTable)
          .where(eq(schema.sessionsTable.id, id))
          .execute(),
    });

    return {
      update: (params) =>
        updateSession(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findById: (id) =>
        findSessionById(id).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
    };
  })
);
