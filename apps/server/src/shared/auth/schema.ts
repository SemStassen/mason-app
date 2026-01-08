import { Schema } from "effect";
import { UserId } from "~/domains/identity/schemas/user.model";
import { Email } from "../schemas";

export type AuthSession = typeof AuthSession.Type;
export const AuthSession = Schema.Struct({
  id: Schema.NonEmptyString,
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc,
  userId: UserId,
  expiresAt: Schema.DateTimeUtc,
  token: Schema.NonEmptyString,
  ipAddress: Schema.OptionFromSelf(Schema.NonEmptyString),
  userAgent: Schema.OptionFromSelf(Schema.NonEmptyString),
  activeOrganizationId: Schema.OptionFromSelf(Schema.NonEmptyString),
});

export type AuthUser = typeof AuthUser.Type;
export const AuthUser = Schema.Struct({
  id: UserId,
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc,
  email: Email,
  emailVerified: Schema.Boolean,
  name: Schema.NonEmptyString,
  image: Schema.OptionFromSelf(Schema.NonEmptyString),
});
