import { PlainApiKey } from "@mason/framework";
import { Schema } from "effect";
import { WorkspaceIntegration } from "./domain/workspace-integration.model";

export type WorkspaceIntegrationToCreate =
  typeof WorkspaceIntegrationToCreate.Type;
export const WorkspaceIntegrationToCreate = Schema.TaggedStruct(
  "integration/WorkspaceIntegrationToCreate",
  {
    // General
    kind: WorkspaceIntegration.fields.kind,
    plainApiKey: PlainApiKey,
    // Nullable
    _metadata: Schema.optionalWith(WorkspaceIntegration.fields._metadata, {
      default: () => null,
      exact: true,
    }),
  }
);

export type WorkspaceIntegrationToUpdate =
  typeof WorkspaceIntegrationToUpdate.Type;
export const WorkspaceIntegrationToUpdate = Schema.TaggedStruct(
  "integration/WorkspaceIntegrationToUpdate",
  {
    id: WorkspaceIntegration.fields.id,
    // General
    plainApiKey: Schema.optionalWith(PlainApiKey, {
      exact: true,
    }),
    // Nullable
    _metadata: Schema.optionalWith(WorkspaceIntegration.fields._metadata, {
      exact: true,
    }),
  }
);
