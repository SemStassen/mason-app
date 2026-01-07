import { Schema } from "effect";
import { PlainApiKey } from "~/shared/schemas";
import { WorkspaceIntegration } from "./workspace-integration.model";

const WorkspaceIntegrationFields = WorkspaceIntegration.from.fields;

export const WorkspaceIntegrationCommands = {
  Create: Schema.Struct({
    kind: WorkspaceIntegrationFields.kind,
    plainApiKey: PlainApiKey,
  }),
  Update: Schema.Struct({
    workspaceIntegrationId: WorkspaceIntegrationFields.id,
    plainApiKey: PlainApiKey,
  }),
} as const;

export type CreateWorkspaceIntegrationCommand =
  typeof WorkspaceIntegrationCommands.Create.Type;
export type UpdateWorkspaceIntegrationCommand =
  typeof WorkspaceIntegrationCommands.Update.Type;
