import { Schema } from "effect";

export class SessionNotFoundError extends Schema.TaggedError<SessionNotFoundError>()(
  "identity/SessionNotFoundError",
  {}
) {}

export class UserNotFoundError extends Schema.TaggedError<UserNotFoundError>()(
  "identity/UserNotFoundError",
  {}
) {}
