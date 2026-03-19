import { WorkspaceIntegration } from "@mason/core/modules/integration";
import type { RepositoryError } from "@mason/core/shared/database";
import type {
  PlainApiKey,
  WorkspaceIntegrationId,
} from "@mason/core/shared/schemas";
import { type Effect, Schema, ServiceMap } from "effect";

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

export interface IntegrationModuleShape {
  readonly createWorkspaceIntegration: (params: {
    workspaceId: WorkspaceIntegration["workspaceId"];
    createdByWorkspaceMemberId: WorkspaceIntegration["createdByWorkspaceMemberId"];
    data: typeof WorkspaceIntegration.jsonCreate.Type;
  }) => Effect.Effect<
    WorkspaceIntegration,
    WorkspaceIntegrationProviderAlreadyExistsError | RepositoryError
  >;
  readonly updateWorkspaceIntegration: (params: {
    id: WorkspaceIntegration["id"];
    workspaceId: WorkspaceIntegration["workspaceId"];
    data: typeof WorkspaceIntegration.jsonUpdate.Type;
  }) => Effect.Effect<
    WorkspaceIntegration,
    WorkspaceIntegrationNotFoundError | RepositoryError
  >;
  readonly hardDeleteWorkspaceIntegration: (params: {
    id: WorkspaceIntegrationId;
    workspaceId: WorkspaceIntegration["workspaceId"];
  }) => Effect.Effect<
    void,
    WorkspaceIntegrationNotFoundError | RepositoryError
  >;
  readonly revealWorkspaceIntegrationApiKey: (params: {
    workspaceId: WorkspaceIntegration["workspaceId"];
    id: WorkspaceIntegration["id"];
  }) => Effect.Effect<
    PlainApiKey,
    WorkspaceIntegrationNotFoundError | RepositoryError
  >;
}

export class IntegrationModule extends ServiceMap.Service<
  IntegrationModule,
  IntegrationModuleShape
>()("@mason/integration/IntegrationModule") {}
