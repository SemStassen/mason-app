import { Session, SessionRepository } from "@recount/core/modules/identity";
import { RepositoryError } from "@recount/core/shared/repository";
import { Database, schema } from "@recount/db";
import { eq } from "drizzle-orm";
import { Effect, Layer, Schema } from "effect";
import { SqlSchema } from "effect/unstable/sql";

export const SessionRepositoryLayer = Layer.effect(
  SessionRepository,
  Effect.gen(function* () {
    const db = yield* Database;

    const updateSession = SqlSchema.findOne({
      Request: Schema.Struct({
        id: Session.fields.id,
        update: Session.update,
      }),
      Result: Session,
      execute: ({ id, update }) =>
        db.drizzle((drizzle) =>
          drizzle
            .update(schema.sessionsTable)
            .set(update)
            .where(eq(schema.sessionsTable.id, id))
            .returning()
            .execute()
        ),
    });

    const findSessionById = SqlSchema.findOneOption({
      Request: Session.fields.id,
      Result: Session,
      execute: (id) =>
        db.drizzle((drizzle) =>
          drizzle
            .select()
            .from(schema.sessionsTable)
            .where(eq(schema.sessionsTable.id, id))
            .execute()
        ),
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
