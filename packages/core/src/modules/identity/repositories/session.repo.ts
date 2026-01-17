import { Context, type Effect, type Option } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/infra/db";
import type { SessionId, UserId } from "~/shared/schemas";
import type { AtLeastOne } from "~/shared/utils";
import type { Session } from "../domain/session.model";

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
        id: SessionId;
        userId: UserId;
      }>;
    }) => Effect.Effect<Option.Option<Session>, DatabaseError>;
  }
>() {}
