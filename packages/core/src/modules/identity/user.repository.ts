import { type Effect, type Option, ServiceMap } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { RepositoryError } from "#shared/database/index";
import type { User } from "./domain/user.entity";

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

export class UserRepository extends ServiceMap.Service<
	UserRepository,
	UserRepositoryShape
>()("@mason/identity/UserRepository") {}
