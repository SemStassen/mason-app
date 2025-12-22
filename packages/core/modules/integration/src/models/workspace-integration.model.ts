import {
  MemberId,
  WorkspaceId,
  WorkspaceIntegrationId,
} from "@mason/framework/types";
import { Effect, Schema } from "effect";

export class WorkspaceIntegration extends Schema.Class<WorkspaceIntegration>(
  "integration/WorkspaceIntegration"
)(
  Schema.Struct({
    id: WorkspaceIntegrationId,
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
      })
    ),
    // Metadata
    createdAt: Schema.DateFromSelf,
  })
) {
  static readonly Patch = Schema.Struct({
    apiKeyEncrypted: Schema.optionalWith(
      WorkspaceIntegration.fields.apiKeyEncrypted,
      { exact: true }
    ),
    _metadata: Schema.optionalWith(WorkspaceIntegration.fields._metadata, {
      exact: true,
    }),
  });
  patch(updates: typeof WorkspaceIntegration.Patch.Type) {
    return Schema.decodeUnknown(WorkspaceIntegration.Patch)(updates).pipe(
      Effect.map((validated) =>
        WorkspaceIntegration.make({
          ...this,
          ...validated,
          _metadata: {
            ...this._metadata,
            ...validated._metadata,
          },
        })
      )
    );
  }
}
