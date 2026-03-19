import { Schema } from "effect";

import { Model } from "#shared/effect/index";
import {
  EncryptedApiKey,
  PlainApiKey,
  WorkspaceId,
  WorkspaceIntegrationId,
  WorkspaceMemberId,
} from "#shared/schemas/index";

const WorkspaceIntegrationProvider = Schema.Literal("float").pipe(
  Schema.brand("WorkspaceIntegrationProvider")
);

export class WorkspaceIntegration extends Model.Class<WorkspaceIntegration>(
  "WorkspaceIntegration"
)(
  {
    id: Model.ServerImmutable(WorkspaceIntegrationId),
    workspaceId: Model.ServerImmutable(WorkspaceId),
    createdByWorkspaceMemberId: Model.ServerImmutable(WorkspaceMemberId),
    provider: Model.ServerImmutableClientImmutable(
      WorkspaceIntegrationProvider
    ),
    apiKey: Model.Field({
      select: EncryptedApiKey,
      insert: EncryptedApiKey,
      update: Schema.optionalKey(EncryptedApiKey),
      jsonCreate: PlainApiKey,
      jsonUpdate: Schema.optionalKey(PlainApiKey),
    }),
    _metadata: Model.ServerMutableOptional(
      Schema.Struct({
        lastSyncedAt: Schema.optionalKey(Schema.DateTimeUtcFromDate),
      })
    ),
    createdAt: Model.ServerImmutable(Schema.DateTimeUtcFromDate),
  },
  {
    identifier: "WorkspaceIntegration",
    title: "Workspace Integration",
    description: "An integration connecting a workspace to an external service",
  }
) {}
