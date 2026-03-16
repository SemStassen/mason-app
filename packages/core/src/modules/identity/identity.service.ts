import { type Effect, type Option, Schema, ServiceMap } from "effect";
import type { RepositoryError } from "#shared/database/index";
import { SessionId, UserId } from "#shared/schemas/index";
import type { Session } from "./domain/session.entity";
import type { User } from "./domain/user.entity";

export class SessionNotFoundError extends Schema.TaggedErrorClass<SessionNotFoundError>()(
	"identity/SessionNotFoundError",
	{
		sessionId: SessionId,
	},
) {}

export class UserNotFoundError extends Schema.TaggedErrorClass<UserNotFoundError>()(
	"identity/UserNotFoundError",
	{
		userId: UserId,
	},
) {}

interface IdentityModuleShape {
	readonly setActiveWorkspace: (params: {
		sessionId: Session["id"];
		workspaceId: Session["activeWorkspaceId"];
	}) => Effect.Effect<Session, SessionNotFoundError | RepositoryError>;
	readonly createUser: (
		data: typeof User.jsonCreate.Type,
	) => Effect.Effect<User, RepositoryError>;
	readonly updateUser: (params: {
		userId: User["id"];
		data: typeof User.jsonUpdate.Type;
	}) => Effect.Effect<User, UserNotFoundError | RepositoryError>;
	readonly retrieveUserByEmail: (
		email: User["email"],
	) => Effect.Effect<Option.Option<User>, RepositoryError>;
}

export class IdentityModule extends ServiceMap.Service<
	IdentityModule,
	IdentityModuleShape
>()("@mason/identity/IdentityModule") {}
