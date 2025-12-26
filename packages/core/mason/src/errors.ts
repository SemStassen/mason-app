import { Schema } from "effect";

export class InternalError extends Schema.TaggedError<InternalError>()(
  "mason/InternalError",
  {
    cause: Schema.Unknown,
  }
) {}

export class NotFoundError extends Schema.TaggedError<NotFoundError>()(
  "mason/NotFoundError",
  {
    cause: Schema.Unknown,
  }
) {}

export class InvalidExternalApiKeyError extends Schema.TaggedError<InvalidExternalApiKeyError>()(
  "mason/InvalidExternalApiKeyError",
  {
    cause: Schema.Unknown,
  }
) {}
