import { type Effect, type Option, ServiceMap } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { RepositoryError } from "#shared/database/index";
import type {
	WorkspaceId,
	WorkspaceIntegrationId,
} from "#shared/schemas/index";
import type { WorkspaceIntegration } from "./domain/workspace-integration.entity";

export interface WorkspaceIntegrationRepositoryShape {
	readonly insert: (params: {
		workspaceIntegrations: NonEmptyReadonlyArray<WorkspaceIntegration>;
	}) => Effect.Effect<ReadonlyArray<WorkspaceIntegration>, RepositoryError>;
	readonly update: (params: {
		workspaceId: WorkspaceId;
		workspaceIntegrations: NonEmptyReadonlyArray<WorkspaceIntegration>;
	}) => Effect.Effect<ReadonlyArray<WorkspaceIntegration>, RepositoryError>;
	readonly hardDelete: (params: {
		workspaceId: WorkspaceId;
		ids: NonEmptyReadonlyArray<WorkspaceIntegrationId>;
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
