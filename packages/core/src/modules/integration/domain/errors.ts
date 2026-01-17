import { Schema } from "effect";

export class WorkspaceIntegrationProviderAlreadyExistsError extends Schema.TaggedError<WorkspaceIntegrationProviderAlreadyExistsError>()(
  "integration/WorkspaceIntegrationProviderAlreadyExistsError",
  {}
) {}
