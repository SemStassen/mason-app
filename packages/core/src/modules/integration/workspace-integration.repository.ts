import { type Effect, type Option, ServiceMap } from "effect";
import type { RepositoryError } from "#shared/database/index";
import type { WorkspaceId } from "#shared/schemas/index";
import type { WorkspaceIntegration } from "./domain/workspace-integration.entity";

export interface WorkspaceIntegrationRepositoryShape {
  readonly insert: (
    data: typeof WorkspaceIntegration.insert.Type
  ) => Effect.Effect<WorkspaceIntegration, RepositoryError>;
  readonly update: (params: {
    workspaceId: WorkspaceId;
    id: WorkspaceIntegration["id"];
    update: typeof WorkspaceIntegration.update.Type;
  }) => Effect.Effect<WorkspaceIntegration, RepositoryError>;
  readonly hardDelete: (params: {
    workspaceId: WorkspaceId;
    id: WorkspaceIntegration["id"];
  }) => Effect.Effect<void, RepositoryError>;
  readonly findById: (params: {
    workspaceId: WorkspaceIntegration["workspaceId"];
    id: WorkspaceIntegration["id"];
  }) => Effect.Effect<Option.Option<WorkspaceIntegration>, RepositoryError>;
  readonly findByProvider: (params: {
    workspaceId: WorkspaceIntegration["workspaceId"];
    provider: WorkspaceIntegration["provider"];
  }) => Effect.Effect<Option.Option<WorkspaceIntegration>, RepositoryError>;
}

export class WorkspaceIntegrationRepository extends ServiceMap.Service<
  WorkspaceIntegrationRepository,
  WorkspaceIntegrationRepositoryShape
>()("@mason/integration/WorkspaceIntegrationRepository") {}
