import { type DateTime, Option, Result } from "effect";
import { WorkspaceIntegrationId } from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";
import { WorkspaceIntegration } from "./workspace-integration.entity";

export const createWorkspaceIntegration = (params: {
	workspaceId: WorkspaceIntegration["workspaceId"];
	createdByWorkspaceMemberId: WorkspaceIntegration["createdByWorkspaceMemberId"];
	data: typeof WorkspaceIntegration.jsonCreate.Type;
	apiKey: WorkspaceIntegration["apiKey"];
	now: DateTime.Utc;
}): Result.Result<WorkspaceIntegration, never> =>
	Result.succeed(
		WorkspaceIntegration.make({
			...params.data,
			id: WorkspaceIntegrationId.makeUnsafe(generateUUID()),
			workspaceId: params.workspaceId,
			createdByWorkspaceMemberId: params.createdByWorkspaceMemberId,
			apiKey: params.apiKey,
			_metadata: Option.none(),
			createdAt: params.now,
		}),
	);

export const updateWorkspaceIntegration = (params: {
	workspaceIntegration: WorkspaceIntegration;
	data: typeof WorkspaceIntegration.jsonUpdate.Type;
	apiKey: WorkspaceIntegration["apiKey"];
}): Result.Result<
	{
		entity: WorkspaceIntegration;
		changes: typeof WorkspaceIntegration.update.Type;
	},
	never
> => {
	const { apiKey, ...rest } = params.data;
	return Result.succeed({
		entity: WorkspaceIntegration.make({
			...params.workspaceIntegration,
			...rest,
			apiKey: params.apiKey,
		}),
		changes: {
			...rest,
			apiKey: params.apiKey,
		},
	});
};
