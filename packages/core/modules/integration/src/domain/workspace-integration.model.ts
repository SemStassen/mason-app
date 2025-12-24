import {
  EncryptedApiKey,
  generateUUID,
  MemberId,
  WorkspaceId,
  WorkspaceIntegrationId,
} from "@mason/framework";
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
    encryptedApiKey: EncryptedApiKey,
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
  static readonly Create = Schema.Struct({
    kind: WorkspaceIntegration.fields.kind,
    encryptedApiKey: WorkspaceIntegration.fields.encryptedApiKey,
  });

  static makeFromCreate(
    input: Omit<
      typeof WorkspaceIntegration.Create.Encoded,
      "encryptedApiKey"
    > & {
      encryptedApiKey: EncryptedApiKey;
    },
    workspaceId: WorkspaceId,
    createdByMemberId: MemberId
  ) {
    return Schema.decodeUnknown(WorkspaceIntegration.Create)(input).pipe(
      Effect.map((validated) =>
        WorkspaceIntegration.make({
          ...validated,
          id: WorkspaceIntegrationId.make(generateUUID()),
          workspaceId: workspaceId,
          createdByMemberId: createdByMemberId,
          createdAt: new Date(),
          _metadata: null,
        })
      )
    );
  }
  static readonly Patch = Schema.Struct({
    encryptedApiKey: Schema.optionalWith(
      WorkspaceIntegration.fields.encryptedApiKey,
      { exact: true }
    ),
    _metadata: Schema.optionalWith(WorkspaceIntegration.fields._metadata, {
      exact: true,
    }),
  });
  patch(
    updates: Omit<
      typeof WorkspaceIntegration.Patch.Encoded,
      "encryptedApiKey"
    > & {
      encryptedApiKey: EncryptedApiKey;
    }
  ) {
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
