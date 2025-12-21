import { Schema } from "effect";
import { WorkspaceIntegration } from "./workspace-integration.model";

export type WorkspaceIntegrationToCreate =
  typeof WorkspaceIntegrationToCreate.Type;
export const WorkspaceIntegrationToCreate = Schema.TaggedStruct(
  "WorkspaceIntegrationToCreate",
  {
    // General
    kind: WorkspaceIntegration.fields.kind,
    apiKeyUnencrypted: Schema.NonEmptyString,
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
  "WorkspaceIntegrationToUpdate",
  {
    id: WorkspaceIntegration.fields.id,
    // General
    apiKeyUnencrypted: Schema.optionalWith(Schema.NonEmptyString, {
      exact: true,
    }),
    // Nullable
    _metadata: Schema.optionalWith(WorkspaceIntegration.fields._metadata, {
      exact: true,
    }),
  }
);
