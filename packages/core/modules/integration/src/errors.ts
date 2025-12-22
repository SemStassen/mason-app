import { Schema } from "effect";

export class InternalIntegrationModuleError extends Schema.TaggedError<InternalIntegrationModuleError>()(
  "integrations/InternalIntegrationModuleError",
  {
    cause: Schema.Unknown,
  }
) {}

export class WorkspaceIntegrationNotFoundError extends Schema.TaggedError<WorkspaceIntegrationNotFoundError>()(
  "integrations/WorkspaceIntegrationNotFoundError",
  {}
) {}
