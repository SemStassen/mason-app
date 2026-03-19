import { ServiceMap } from "effect";
import type { Effect, Option } from "effect";

import type { RepositoryError } from "#shared/database/index";

import type { Session } from "./domain/session.entity";

export interface SessionRepositoryShape {
  readonly update: (params: {
    id: Session["id"];
    update: typeof Session.update.Type;
  }) => Effect.Effect<Session, RepositoryError>;
  readonly findById: (
    id: Session["id"]
  ) => Effect.Effect<Option.Option<Session>, RepositoryError>;
}

export class SessionRepository extends ServiceMap.Service<
  SessionRepository,
  SessionRepositoryShape
>()("@mason/identity/SessionRepository") {}
