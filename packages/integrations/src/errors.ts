import type { DatabaseError } from "@mason/core/services/db";
import type { WorkspaceIntegrationNotFoundError } from "@mason/core/services/workspace-integrations";
import { Schema } from "effect";

export class IntegrationFetchError extends Schema.TaggedError<IntegrationFetchError>()(
  "@mason/integrations/integrationFetchError",
  {
    kind: Schema.Literal("float"),
    error: Schema.Unknown,
  }
) {}

export type IntegrationAdapterError =
  | WorkspaceIntegrationNotFoundError
  | DatabaseError
  | IntegrationFetchError;

export class MissingIntegrationAdapterError extends Schema.TaggedError<MissingIntegrationAdapterError>()(
  "@mason/integrations/missingIntegrationAdapterError",
  {
    cause: Schema.Unknown,
  }
) {}
