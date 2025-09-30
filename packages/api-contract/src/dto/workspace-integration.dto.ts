import { Schema } from "effect";

class WorkspaceIntegration extends Schema.Struct({
  id: Schema.NonEmptyString,
  // References
  workspaceId: Schema.NonEmptyString,
  // General
  kind: Schema.Literal("float"),
}) {}

export const UpsertWorkspaceIntegrationRequest = Schema.Struct({
  kind: WorkspaceIntegration.fields.kind,
  apiKeyUnencrypted: Schema.NonEmptyString,
});

export const DeleteWorkspaceIntegrationRequest = Schema.Struct({
  id: WorkspaceIntegration.fields.id,
});

export const WorkspaceIntegrationResponse = Schema.TaggedStruct("WorkspaceIntegrationResponse",
  WorkspaceIntegration.fields
);
