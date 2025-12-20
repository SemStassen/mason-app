import { Schema } from "effect";

const WorkspaceIntegration = Schema.Struct({
  id: Schema.NonEmptyString,
  // References
  workspaceId: Schema.NonEmptyString,
  // General
  kind: Schema.Literal("float"),
  // Optional
  _metadata: Schema.Struct({
    lastSyncedAt: Schema.optionalWith(Schema.Date, {
      exact: true,
    }),
  }),
  // Metadata
  createdAt: Schema.Date,
});

export const CreateWorkspaceIntegrationRequest = Schema.Struct({
  kind: WorkspaceIntegration.fields.kind,
  apiKeyUnencrypted: Schema.NonEmptyString,
});

export const UpdateWorkspaceIntegrationRequest = Schema.Struct({
  id: WorkspaceIntegration.fields.id,
  apiKeyUnencrypted: Schema.NonEmptyString,
});

export const DeleteWorkspaceIntegrationRequest = Schema.Struct({
  id: WorkspaceIntegration.fields.id,
});

export const WorkspaceIntegrationResponse = Schema.TaggedStruct(
  "WorkspaceIntegrationResponse",
  {
    ...WorkspaceIntegration.fields,
    // Optional
    _metadata: Schema.NullOr(WorkspaceIntegration.fields._metadata),
  }
);
