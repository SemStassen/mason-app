import { type Effect, type Option, ServiceMap } from "effect";
import type { RepositoryError } from "~/shared/errors";
import type { Session } from "./domain/session.entity";

export interface SessionRepositoryShape {
	readonly update: (
		data: typeof Session.update.Type,
	) => Effect.Effect<Session, RepositoryError>;
	readonly findById: (
		id: Session["id"],
	) => Effect.Effect<Option.Option<Session>, RepositoryError>;
}

export class SessionRepository extends ServiceMap.Service<
	SessionRepository,
	SessionRepositoryShape
>()("@mason/identity/SessionRepository") {}
