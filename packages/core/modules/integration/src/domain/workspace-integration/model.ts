import {
  EncryptedApiKey,
  ExistingMemberId,
  ExistingWorkspaceId,
  ExistingWorkspaceIntegrationId,
} from "@mason/framework";
import { Schema } from "effect";

// =============================================================================
// Schema
// =============================================================================

/**
 * Workspace integration field definitions.
 *
 * Used to construct the WorkspaceIntegration domain model and derive DTOs.
 * Access individual fields via `WorkspaceIntegrationFields.fields.fieldName`.
 *
 * @category Schema
 * @since 0.1.0
 */
export const WorkspaceIntegrationFields = Schema.TaggedStruct(
  "@mason/integration/WorkspaceIntegration",
  {
    id: ExistingWorkspaceIntegrationId,
    workspaceId: ExistingWorkspaceId,
    createdByMemberId: ExistingMemberId,
    kind: Schema.Literal("float"),
    encryptedApiKey: EncryptedApiKey,
    _metadata: Schema.OptionFromSelf(
      Schema.Struct({
        lastSyncedAt: Schema.optionalWith(Schema.DateTimeUtcFromSelf, {
          exact: true,
        }),
      })
    ),
    createdAt: Schema.DateTimeUtcFromSelf,
  }
);

/**
 * Workspace integration domain model.
 *
 * Represents an integration connecting a workspace to an external service.
 *
 * @category Models
 * @since 0.1.0
 */
export type WorkspaceIntegration = typeof WorkspaceIntegration.Type;
export const WorkspaceIntegration = WorkspaceIntegrationFields.pipe(
  Schema.Data,
  Schema.annotations({
    identifier: "WorkspaceIntegration",
    title: "Workspace Integration",
    description: "An integration connecting a workspace to an external service",
  })
);
