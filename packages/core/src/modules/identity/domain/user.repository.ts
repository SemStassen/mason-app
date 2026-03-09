import { type Effect, type Option, ServiceMap } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { RepositoryError } from "~/shared/errors";
import type { User } from "./user.entity";

export interface UserRepositoryShape {
	readonly insert: (
		data: NonEmptyReadonlyArray<typeof User.insert.Type>,
	) => Effect.Effect<NonEmptyReadonlyArray<User>, RepositoryError>;
	readonly update: (
		data: typeof User.update.Type,
	) => Effect.Effect<User, RepositoryError>;
	readonly findById: (
		id: User["id"],
	) => Effect.Effect<Option.Option<User>, RepositoryError>;
	readonly findByEmail: (
		email: User["email"],
	) => Effect.Effect<Option.Option<User>, RepositoryError>;
}

export const UserRepository = ServiceMap.Service<UserRepositoryShape>(
	"@mason/identity/UserRepository",
);
