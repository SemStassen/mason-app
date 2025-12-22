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

export type CreateWorkspaceIntegrationRequest =
  typeof CreateWorkspaceIntegrationRequest.Type;
export const CreateWorkspaceIntegrationRequest = Schema.Struct({
  kind: WorkspaceIntegration.fields.kind,
  apiKeyUnencrypted: Schema.NonEmptyString,
});

export type UpdateWorkspaceIntegrationRequest =
  typeof UpdateWorkspaceIntegrationRequest.Type;
export const UpdateWorkspaceIntegrationRequest = Schema.Struct({
  id: WorkspaceIntegration.fields.id,
  apiKeyUnencrypted: Schema.NonEmptyString,
});

export type DeleteWorkspaceIntegrationRequest =
  typeof DeleteWorkspaceIntegrationRequest.Type;
export const DeleteWorkspaceIntegrationRequest = Schema.Struct({
  id: WorkspaceIntegration.fields.id,
});

export type WorkspaceIntegrationResponse =
  typeof WorkspaceIntegrationResponse.Type;
export const WorkspaceIntegrationResponse = Schema.TaggedStruct(
  "WorkspaceIntegrationResponse",
  {
    ...WorkspaceIntegration.fields,
    // Optional
    _metadata: Schema.NullOr(WorkspaceIntegration.fields._metadata),
  }
);
