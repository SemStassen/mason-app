import { Schema } from "effect";

export class UserAlreadyWorkspaceMemberError extends Schema.TaggedError<UserAlreadyWorkspaceMemberError>()(
  "member/UserAlreadyWorkspaceMemberError",
  {}
) {}

export class UserNotWorkspaceMemberError extends Schema.TaggedError<UserNotWorkspaceMemberError>()(
  "member/UserNotWorkspaceMemberError",
  {}
) {}
