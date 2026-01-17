import { Schema } from "effect";

export class InternalAdapterError extends Schema.TaggedError<InternalAdapterError>()(
  "adapters/InternalAdapterError",
  {
    cause: Schema.Unknown,
  }
) {}

export class InvalidApiKeyError extends Schema.TaggedError<InvalidApiKeyError>()(
  "adapters/InvalidApiKeyError",
  {
    provider: Schema.Literal("float"),
    path: Schema.String,
    error: Schema.Unknown,
  }
) {}

export type AdapterError = typeof AdapterError.Type;
export const AdapterError = Schema.Union(
  InternalAdapterError,
  InvalidApiKeyError
);
