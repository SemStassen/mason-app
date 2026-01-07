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

export class MemberAlreadyExistsError extends Schema.TaggedError<MemberAlreadyExistsError>()(
  "member/MemberAlreadyExistsError",
  {}
) {}
