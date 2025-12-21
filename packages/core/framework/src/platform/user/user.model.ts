import { Schema } from "effect";
import { UserId } from "../../types/ids";
import { generateUUID } from "../../utils/uuid";

export const User = Schema.Struct({
  id: Schema.optionalWith(UserId, {
    default: () => UserId.make(generateUUID()),
  }),
  // General
  displayName: Schema.NonEmptyString.pipe(Schema.maxLength(100)),
  email: Schema.NonEmptyString,
  emailVerified: Schema.Boolean,
  // Nullable
  imageUrl: Schema.NullOr(Schema.String),
});

export const UserToCreate = Schema.Struct({
  displayName: User.fields.displayName,
  email: User.fields.email,
  emailVerified: User.fields.emailVerified,
});
