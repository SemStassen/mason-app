import { Schema } from "effect";
import { SessionId, UserId } from "~/shared/schemas";

export class SessionNotFoundError extends Schema.TaggedError<SessionNotFoundError>()(
  "identity/SessionNotFoundError",
  {
    id: SessionId,
  }
) {}

export class UserNotFoundError extends Schema.TaggedError<UserNotFoundError>()(
  "identity/UserNotFoundError",
  {
    id: UserId,
  }
) {}
