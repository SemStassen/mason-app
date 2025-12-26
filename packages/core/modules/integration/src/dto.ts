import type { PlainApiKey, WorkspaceIntegrationId } from "@mason/framework";
import type {
  CreateWorkspaceIntegration,
  PatchWorkspaceIntegration,
} from "./workspace-integration";

export interface WorkspaceIntegrationToCreateDTO {
  kind: typeof CreateWorkspaceIntegration.Type.kind;
  plainApiKey: PlainApiKey;
}

export interface WorkspaceIntegrationToUpdateDTO {
  id: WorkspaceIntegrationId;
  plainApiKey?: PlainApiKey;
  _metadata?: typeof PatchWorkspaceIntegration.Type._metadata;
}
