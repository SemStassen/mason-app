import { Schema } from "effect";

const User = Schema.Struct({
  id: Schema.NonEmptyString,
  // General
  displayName: Schema.NonEmptyString,
  email: Schema.NonEmptyString,
  emailVerified: Schema.Boolean,
  // Optional
  imageUrl: Schema.String,
});

export const CreateUserRequest = Schema.Struct({
  displayName: User.fields.displayName,
  email: User.fields.email,
  emailVerified: User.fields.emailVerified,
});

export const UserResponse = Schema.TaggedStruct("UserResponse", {
  ...User.fields,
  // Optional
  imageUrl: Schema.NullOr(User.fields.imageUrl),
});
