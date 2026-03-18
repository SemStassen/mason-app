import { type DateTime, Option, Result } from "effect";
import { WorkspaceIntegrationId } from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";
import { WorkspaceIntegration } from "./workspace-integration.entity";

export const createWorkspaceIntegration = (params: {
  workspaceId: WorkspaceIntegration["workspaceId"];
  createdByWorkspaceMemberId: WorkspaceIntegration["createdByWorkspaceMemberId"];
  apiKey: WorkspaceIntegration["apiKey"];
  data: typeof WorkspaceIntegration.jsonCreate.Type;
  now: DateTime.Utc;
}): Result.Result<WorkspaceIntegration, never> => {
  const { apiKey: _apiKey, ...rest } = params.data;

  return Result.succeed(
    WorkspaceIntegration.make({
      id: WorkspaceIntegrationId.makeUnsafe(generateUUID()),
      workspaceId: params.workspaceId,
      createdByWorkspaceMemberId: params.createdByWorkspaceMemberId,
      apiKey: params.apiKey,
      _metadata: Option.none(),
      createdAt: params.now,
      ...rest,
    })
  );
};

export const updateWorkspaceIntegration = (params: {
  workspaceIntegration: WorkspaceIntegration;
  apiKey: WorkspaceIntegration["apiKey"] | undefined;
  data: typeof WorkspaceIntegration.jsonUpdate.Type;
}): Result.Result<
  {
    entity: WorkspaceIntegration;
    changes: typeof WorkspaceIntegration.update.Type;
  },
  never
> => {
  const { apiKey: _apiKey, ...rest } = params.data;
  let changes: typeof WorkspaceIntegration.update.Type = { ...rest };

  if (params.apiKey !== undefined) {
    changes = {
      ...rest,
      apiKey: params.apiKey,
    };
  }

  return Result.succeed({
    entity: WorkspaceIntegration.make({
      ...params.workspaceIntegration,
      ...changes,
    }),
    changes,
  });
};
