import { Schema } from 'effect';

export class User extends Schema.Struct({
  id: Schema.String.pipe(Schema.brand('UserId')),
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
