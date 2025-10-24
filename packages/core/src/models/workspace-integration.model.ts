import { Schema } from "effect";
import { generateUUID } from "../utils/uuid";
import { MemberId, WorkspaceId, WorkspaceIntegrationId } from "./ids";

// The encrypted API key is kept out of the domain model.
export const WorkspaceIntegration = Schema.Struct({
  id: Schema.optionalWith(WorkspaceIntegrationId, {
    default: () => WorkspaceIntegrationId.make(generateUUID()),
  }),
  // References
  workspaceId: WorkspaceId,
  createdByMemberId: MemberId,
  // General
  kind: Schema.Literal("float"),
  apiKeyEncrypted: Schema.NonEmptyString,
  // Nullable
  _metadata: Schema.NullOr(
    Schema.Struct({
      lastSyncedAt: Schema.optionalWith(Schema.Date, {
        exact: true,
      }),
    }),
  ),
  // Metadata
  createdAt: Schema.DateFromSelf,
});

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
  },
);

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
  },
);

export const WorkspaceIntegrationToUpsert = Schema.Union(
  WorkspaceIntegrationToCreate,
  WorkspaceIntegrationToUpdate,
);
