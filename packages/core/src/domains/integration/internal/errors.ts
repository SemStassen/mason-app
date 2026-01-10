import { Schema } from "effect";

export class IntegrationDomainError extends Schema.TaggedError<IntegrationDomainError>()(
  "integration/IntegrationDomainError",
  {
    cause: Schema.Unknown,
  }
) {}

export class WorkspaceIntegrationNotFoundError extends Schema.TaggedError<WorkspaceIntegrationNotFoundError>()(
  "integration/WorkspaceIntegrationNotFoundError",
  {}
) {}
