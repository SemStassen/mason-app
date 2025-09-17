import { Schema } from "effect";
import { generateUUID } from "~/utils/uuid";
import { UserId } from "./shared";

export class User extends Schema.Struct({
  id: Schema.optionalWith(UserId, {
    default: () => UserId.make(generateUUID()),
  }),
  // General
  displayName: Schema.NonEmptyString.pipe(Schema.maxLength(100)),
  email: Schema.NonEmptyString,
  emailVerified: Schema.Boolean,
  imageUrl: Schema.NullOr(Schema.String),
}) {}

export const CreateUserRequest = Schema.Struct({
  displayName: User.fields.displayName,
  email: User.fields.email,
  emailVerified: User.fields.emailVerified,
});

export const UserResponse = Schema.Struct({
  ...User.fields,
  id: Schema.String,
});
