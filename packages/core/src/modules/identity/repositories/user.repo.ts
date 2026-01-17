import { Context, type Effect, type Option } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/infra/db";
import type { UserId } from "~/shared/schemas";
import type { AtLeastOne } from "~/shared/utils";
import type { User } from "../domain/user.model";

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
    retrieve: (params: {
      query: AtLeastOne<{
        id?: UserId;
        email?: User["email"];
      }>;
    }) => Effect.Effect<Option.Option<User>, DatabaseError>;
    hardDelete: (params: {
      userIds: NonEmptyReadonlyArray<UserId>;
    }) => Effect.Effect<void, DatabaseError>;
  }
>() {}
