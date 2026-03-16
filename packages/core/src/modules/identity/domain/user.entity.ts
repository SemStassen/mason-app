import { Model, Schema } from "#shared/effect/index";
import { Email, UserId } from "#shared/schemas/index";

export class User extends Model.Class<User>("User")(
  {
    id: Model.ServerImmutable(UserId),
    displayName: Model.ClientMutable(
      Schema.NonEmptyTrimmedString.check(Schema.isMaxLength(100))
    ),
    email: Model.ClientRequiredImmutable(Email),
    emailVerified: Model.ServerManaged(Schema.Boolean),
    imageUrl: Model.ClientMutableOptional(Schema.NonEmptyTrimmedString),
  },
  {
    identifier: "User",
    title: "User",
    description: "A user",
  }
) {}
