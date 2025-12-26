import {
  EncryptedApiKey,
  ExistingMemberId,
  ExistingWorkspaceId,
  ExistingWorkspaceIntegrationId,
  generateUUID,
} from "@mason/framework";
import { Effect, Schema } from "effect";
import { dual } from "effect/Function";
import type { ParseError } from "effect/ParseResult";

// =============================================================================
// Schema
// =============================================================================

const WorkspaceIntegrationBase = Schema.TaggedStruct("WorkspaceIntegration", {
  id: ExistingWorkspaceIntegrationId,
  workspaceId: ExistingWorkspaceId,
  createdByMemberId: ExistingMemberId,
  kind: Schema.Literal("float"),
  encryptedApiKey: EncryptedApiKey,
  _metadata: Schema.NullOr(
    Schema.Struct({
      lastSyncedAt: Schema.optionalWith(Schema.Date, {
        exact: true,
      }),
    })
  ),
  createdAt: Schema.DateFromSelf,
});

export type WorkspaceIntegration = typeof WorkspaceIntegration.Type;
export const WorkspaceIntegration = WorkspaceIntegrationBase.pipe(
  Schema.Data,
  Schema.annotations({
    identifier: "WorkspaceIntegration",
    title: "Workspace Integration",
    description: "An integration connecting a workspace to an external service",
  })
);

// =============================================================================
// Creation
// =============================================================================

export const CreateWorkspaceIntegration = Schema.Struct({
  workspaceId: WorkspaceIntegrationBase.fields.workspaceId,
  createdByMemberId: WorkspaceIntegrationBase.fields.createdByMemberId,
  kind: WorkspaceIntegrationBase.fields.kind,
  encryptedApiKey: WorkspaceIntegrationBase.fields.encryptedApiKey,
});

/**
 * Create a workspace integration from creation input.
 *
 * @since 0.1.0
 */
export const createWorkspaceIntegration = (
  input: typeof CreateWorkspaceIntegration.Type
): Effect.Effect<WorkspaceIntegration, ParseError> =>
  Schema.decodeUnknown(CreateWorkspaceIntegration)(input).pipe(
    Effect.flatMap((validated) =>
      Schema.decodeUnknown(WorkspaceIntegration)({
        ...validated,
        id: ExistingWorkspaceIntegrationId.make(generateUUID()),
        createdAt: new Date(),
        _metadata: null,
      })
    )
  );

// =============================================================================
// Updates
// =============================================================================

export const PatchWorkspaceIntegration = Schema.Struct({
  encryptedApiKey: Schema.optionalWith(
    WorkspaceIntegrationBase.fields.encryptedApiKey,
    { exact: true }
  ),
  _metadata: Schema.optionalWith(WorkspaceIntegrationBase.fields._metadata, {
    exact: true,
  }),
});

/**
 * Update a workspace integration with patch data.
 *
 * @since 0.1.0
 */
export const updateWorkspaceIntegration = dual<
  (
    updates: typeof PatchWorkspaceIntegration.Type
  ) => (
    self: WorkspaceIntegration
  ) => Effect.Effect<WorkspaceIntegration, ParseError>,
  (
    self: WorkspaceIntegration,
    updates: typeof PatchWorkspaceIntegration.Type
  ) => Effect.Effect<WorkspaceIntegration, ParseError>
>(2, (self, updates) =>
  Schema.decodeUnknown(PatchWorkspaceIntegration)(updates).pipe(
    Effect.flatMap((validated) => {
      const mergedMetadata =
        self._metadata && validated._metadata
          ? { ...self._metadata, ...validated._metadata }
          : (validated._metadata ?? self._metadata);

      return Schema.decodeUnknown(WorkspaceIntegration)({
        ...self,
        ...validated,
        _metadata: mergedMetadata,
      });
    })
  )
);
