import { Schema } from "effect";

export class AuthorizationError extends Schema.TaggedError<AuthorizationError>()(
  "shared/AuthorizationError",
  {
    cause: Schema.Unknown,
  }
) {}
