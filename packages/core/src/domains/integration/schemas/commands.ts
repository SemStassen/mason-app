import { Schema } from "effect";
import { PlainApiKey } from "~/shared/schemas";
import { WorkspaceIntegration } from "./workspace-integration.model";

const WorkspaceIntegrationFields = WorkspaceIntegration.from.fields;

export const WorkspaceIntegrationCommands = {
  Create: Schema.Struct({
    kind: WorkspaceIntegrationFields.kind,
    plainApiKey: PlainApiKey,
  }),
  UpdateApiKey: PlainApiKey,
} as const;

export type CreateWorkspaceIntegrationCommand =
  typeof WorkspaceIntegrationCommands.Create.Type;
export type UpdateWorkspaceIntegrationApiKeyCommand =
  typeof WorkspaceIntegrationCommands.UpdateApiKey.Type;
