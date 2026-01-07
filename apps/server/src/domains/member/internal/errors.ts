import { Schema } from "effect";

export class MemberDomainError extends Schema.TaggedError<MemberDomainError>()(
  "member/MemberDomainError",
  {
    cause: Schema.Unknown,
  }
) {}

export class MemberNotFoundError extends Schema.TaggedError<MemberNotFoundError>()(
  "member/MemberNotFoundError",
  {}
) {}
