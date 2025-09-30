import { Schema } from "effect";
import { generateUUID } from "../utils/uuid";
import { UserId } from "./ids";

export class User extends Schema.Struct({
  id: Schema.optionalWith(UserId, {
    default: () => UserId.make(generateUUID()),
  }),
  // General
  displayName: Schema.NonEmptyString.pipe(Schema.maxLength(100)),
  email: Schema.NonEmptyString,
  emailVerified: Schema.Boolean,
  // Optional
  imageUrl: Schema.NullOr(Schema.String),
}) {}

export const UserToCreate = Schema.Struct({
  displayName: User.fields.displayName,
  email: User.fields.email,
  emailVerified: User.fields.emailVerified,
});
