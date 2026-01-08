import { Schema } from "effect";
import { MemberId } from "~/domains/member";
import { WorkspaceId } from "~/domains/workspace";
import { EncryptedApiKey } from "~/shared/schemas";

export type WorkspaceIntegrationId = typeof WorkspaceIntegrationId.Type;
export const WorkspaceIntegrationId = Schema.UUID.pipe(
  Schema.brand("WorkspaceIntegrationId")
);

export type WorkspaceIntegrationKind = typeof WorkspaceIntegrationKind.Type;
export const WorkspaceIntegrationKind = Schema.Literal("float").pipe(
  Schema.brand("WorkspaceIntegrationKind")
);

export type WorkspaceIntegrationMetadata =
  typeof WorkspaceIntegrationMetadata.Type;
export const WorkspaceIntegrationMetadata = Schema.Struct({
  lastSyncedAt: Schema.optionalWith(Schema.DateTimeUtcFromSelf, {
    exact: true,
  }),
});

/**
 * Workspace integration domain model.
 *
 * Represents an integration connecting a workspace to an external service.
 *
 * @category Models
 * @since 0.1.0
 */
export type WorkspaceIntegration = typeof WorkspaceIntegration.Type;
export const WorkspaceIntegration = Schema.TaggedStruct(
  "WorkspaceIntegration",
  {
    id: WorkspaceIntegrationId,
    workspaceId: WorkspaceId,
    createdByMemberId: MemberId,
    kind: WorkspaceIntegrationKind,
    encryptedApiKey: EncryptedApiKey,
    _metadata: Schema.OptionFromSelf(WorkspaceIntegrationMetadata),
    createdAt: Schema.DateTimeUtcFromSelf,
  }
).pipe(
  Schema.Data,
  Schema.annotations({
    identifier: "WorkspaceIntegration",
    title: "Workspace Integration",
    description: "An integration connecting a workspace to an external service",
  })
);
