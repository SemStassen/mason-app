import { Model, Schema } from "#shared/effect/index";
import { Email, UserId } from "#shared/schemas/index";

export class User extends Model.Class<User>("User")(
  {
    id: Model.ServerImmutable(UserId),
    displayName: Model.Mutable(
      Schema.NonEmptyTrimmedString.check(Schema.isMaxLength(100))
    ),
    email: Model.ClientProvided(Email),
    emailVerified: Model.ServerManaged(Schema.Boolean),
    imageUrl: Model.MutableOptional(Schema.NonEmptyTrimmedString),
  },
  {
    identifier: "User",
    title: "User",
    description: "A user",
  }
) {}
