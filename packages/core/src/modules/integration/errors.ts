import { Schema } from "effect";

export class WorkspaceIntegrationNotFoundError extends Schema.TaggedError<WorkspaceIntegrationNotFoundError>()(
  "integration/WorkspaceIntegrationNotFoundError",
  {}
) {}
