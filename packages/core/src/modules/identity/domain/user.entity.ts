import { Schema } from "effect";

import { Model } from "#internal/effect/index";
import { Email, UserId } from "#shared/schemas/index";

export class User extends Model.Class<User>("User")(
  {
    id: Model.ServerImmutable(UserId),

    email: Model.ServerMutableClientImmutable(Email),
    emailVerified: Model.ServerMutable(Schema.Boolean),
  },
  {
    identifier: "User",
    title: "User",
    description: "A user",
  }
) {}
