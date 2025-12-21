import type { IntegrationError } from "@mason/framework/platform";
import { Schema } from "effect";

export class IntegrationInvalidApiKeyError extends Schema.TaggedError<IntegrationInvalidApiKeyError>()(
  "@mason/integrations/integrationInvalidApiKeyError",
  {
    kind: Schema.Literal("float"),
    path: Schema.String,
    error: Schema.Unknown,
  }
) {}

export class IntegrationFetchError extends Schema.TaggedError<IntegrationFetchError>()(
  "@mason/integrations/integrationFetchError",
  {
    kind: Schema.Literal("float"),
    path: Schema.String,
    error: Schema.Unknown,
  }
) {}

export class IntegrationDecodingError extends Schema.TaggedError<IntegrationDecodingError>()(
  "@mason/integrations/integrationDecodingError",
  {
    error: Schema.Unknown,
  }
) {}

export type IntegrationAdapterError =
  | IntegrationError
  | IntegrationFetchError
  | IntegrationDecodingError
  | IntegrationInvalidApiKeyError;
