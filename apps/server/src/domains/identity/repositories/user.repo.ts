import { Context, type Effect, type Option } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/shared/errors";
import type { UserId } from "~/shared/schemas";
import type { User } from "../schemas/user.model";

export class UserRepository extends Context.Tag(
  "@mason/identity/UserRepository"
)<
  UserRepository,
  {
    insert: (params: {
      users: NonEmptyReadonlyArray<User>;
    }) => Effect.Effect<ReadonlyArray<User>, DatabaseError>;
    update: (params: {
      users: NonEmptyReadonlyArray<User>;
    }) => Effect.Effect<ReadonlyArray<User>, DatabaseError>;
    hardDelete: (params: {
      userIds: NonEmptyReadonlyArray<UserId>;
    }) => Effect.Effect<void, DatabaseError>;
    retrieve: (params: {
      userId: UserId;
    }) => Effect.Effect<Option.Option<User>, DatabaseError>;
  }
>() {}
