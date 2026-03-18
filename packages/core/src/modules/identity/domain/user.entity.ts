import { Model, Schema } from "#shared/effect/index";
import { Email, UserId } from "#shared/schemas/index";

export class User extends Model.Class<User>("User")(
  {
    id: Model.ServerImmutable(UserId),
    displayName: Model.ServerMutableClientMutable(
      Schema.NonEmptyTrimmedString.check(Schema.isMaxLength(100))
    ),
    email: Model.ServerMutableClientImmutable(Email),
    emailVerified: Model.ServerMutable(Schema.Boolean),
    imageUrl: Model.ServerMutableClientMutableOptional(
      Schema.NonEmptyTrimmedString
    ),
  },
  {
    identifier: "User",
    title: "User",
    description: "A user",
  }
) {}
