import { Schema } from "effect";

export class IdentityDomainError extends Schema.TaggedError<IdentityDomainError>()(
  "identity/IdentityDomainError",
  {
    cause: Schema.Unknown,
  }
) {}

export class UserNotFoundError extends Schema.TaggedError<UserNotFoundError>()(
  "identity/UserNotFoundError",
  {}
) {}
