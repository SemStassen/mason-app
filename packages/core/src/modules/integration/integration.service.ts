import { type Effect, Schema, ServiceMap } from "effect";
import type { RepositoryError } from "~/shared/errors";
import {
	type PlainApiKey,
	type WorkspaceId,
	WorkspaceIntegrationId,
} from "~/shared/schemas";
import type { WorkspaceIntegration } from "./domain/workspace-integration.entity";

export class WorkspaceIntegrationNotFoundError extends Schema.TaggedErrorClass<WorkspaceIntegrationNotFoundError>()(
	"integration/WorkspaceIntegrationNotFoundError",
	{
		workspaceIntegrationId: WorkspaceIntegrationId,
	},
) {}

export class WorkspaceIntegrationProviderAlreadyExistsError extends Schema.TaggedErrorClass<WorkspaceIntegrationProviderAlreadyExistsError>()(
	"integration/WorkspaceIntegrationProviderAlreadyExistsError",
	{},
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
		workspaceId: WorkspaceId;
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
