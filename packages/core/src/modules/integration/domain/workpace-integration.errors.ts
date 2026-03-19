import { Schema } from "effect";

import { WorkspaceIntegration } from "./workspace-integration.entity";

export class WorkspaceIntegrationNotFoundError extends Schema.TaggedErrorClass<WorkspaceIntegrationNotFoundError>()(
  "integration/WorkspaceIntegrationNotFoundError",
  {
    workspaceIntegrationId: WorkspaceIntegration.fields.id,
  }
) {}

export class WorkspaceIntegrationProviderAlreadyExistsError extends Schema.TaggedErrorClass<WorkspaceIntegrationProviderAlreadyExistsError>()(
  "integration/WorkspaceIntegrationProviderAlreadyExistsError",
  {}
) {}
