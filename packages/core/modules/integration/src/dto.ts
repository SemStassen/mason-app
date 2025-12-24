import type { PlainApiKey } from "@mason/framework";
import type { WorkspaceIntegration } from "./domain/workspace-integration.model";

export type WorkspaceIntegrationToCreate = Omit<
  typeof WorkspaceIntegration.Create.Type,
  "encryptedApiKey"
> & {
  plainApiKey: PlainApiKey;
};

export type WorkspaceIntegrationToUpdate = Omit<
  typeof WorkspaceIntegration.Patch.Type,
  "encryptedApiKey"
> & {
  id: typeof WorkspaceIntegration.fields.id.Type;
  plainApiKey?: PlainApiKey;
};
