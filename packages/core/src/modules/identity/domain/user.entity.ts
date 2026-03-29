import { Schema } from "effect";

import { Model } from "#internal/effect/index";
import { Email, NonEmptyTrimmedString, UserId } from "#shared/schemas/index";

export class User extends Model.Class<User>("User")(
  {
    id: Model.ServerImmutable(UserId),
    email: Model.ServerMutable(Email),
    emailVerified: Model.ServerMutable(Schema.Boolean),
    // Better Auth seeds this as an empty string on email signup;
    // NonEmptyTrimmedString is enforced on all client input variants but not at the DB level.
    fullName: Model.Field({
      select: Schema.String,
      insert: Schema.String,
      update: Schema.optionalKey(NonEmptyTrimmedString),
      json: Schema.String,
      jsonCreate: Schema.optionalKey(NonEmptyTrimmedString),
      jsonUpdate: Schema.optionalKey(NonEmptyTrimmedString),
    }),
  },
  {
    identifier: "User",
    title: "User",
    description: "A user",
  }
) {}
