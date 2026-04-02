import type {
  WorkspaceIntegration,
  WorkspaceIntegrationNotFoundError,
  WorkspaceIntegrationProviderAlreadyExistsError,
} from "@recount/core/modules/integration";
import type { RepositoryError } from "@recount/core/shared/repository";
import type {
  PlainApiKey,
  WorkspaceIntegrationId,
} from "@recount/core/shared/schemas";
import { ServiceMap } from "effect";
import type { Effect } from "effect";

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
>()("@recount/integration/IntegrationModule") {}
