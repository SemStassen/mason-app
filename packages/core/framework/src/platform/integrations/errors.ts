import { Schema } from "effect";

export class GenericIntegrationError extends Schema.TaggedError<GenericIntegrationError>()(
  "@mason/framework/genericIntegrationError",
  {
    cause: Schema.Unknown,
  }
) {}

export class WorkspaceIntegrationNotFoundError extends Schema.TaggedError<WorkspaceIntegrationNotFoundError>()(
  "@mason/framework/workspaceIntegrationNotFoundError",
  {}
) {}

export type IntegrationError = typeof IntegrationError.Type;
export const IntegrationError = Schema.Union(
  GenericIntegrationError,
  WorkspaceIntegrationNotFoundError
);
