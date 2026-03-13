import { type DateTime, Option, Result } from "effect";
import { WorkspaceIntegrationId } from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";
import { WorkspaceIntegration } from "./workspace-integration.entity";

export const createWorkspaceIntegration = (params: {
	workspaceId: WorkspaceIntegration["workspaceId"];
	createdByWorkspaceMemberId: WorkspaceIntegration["createdByWorkspaceMemberId"];
	provider: WorkspaceIntegration["provider"];
	apiKey: WorkspaceIntegration["apiKey"];
	now: DateTime.Utc;
}): Result.Result<WorkspaceIntegration, never> =>
	Result.succeed(
		WorkspaceIntegration.make({
			...params,
			id: WorkspaceIntegrationId.makeUnsafe(generateUUID()),
			_metadata: Option.none(),
			createdAt: params.now,
		}),
	);

export const updateWorkspaceIntegration = (params: {
	workspaceIntegration: WorkspaceIntegration;
	data: typeof WorkspaceIntegration.jsonUpdate.Type;
	apiKey: WorkspaceIntegration["apiKey"];
}): Result.Result<WorkspaceIntegration, never> =>
	Result.succeed(
		WorkspaceIntegration.make({
			...params.workspaceIntegration,
			...params.data,
			apiKey: params.apiKey,
		}),
	);
