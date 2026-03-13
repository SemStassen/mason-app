import { Schema } from "effect";
import { Model } from "#shared/effect/index";
import {
	EncryptedApiKey,
	PlainApiKey,
	WorkspaceId,
	WorkspaceIntegrationId,
	WorkspaceMemberId,
} from "#shared/schemas/index";

export class WorkspaceIntegration extends Model.Class<WorkspaceIntegration>(
	"WorkspaceIntegration",
)(
	{
		id: Model.ServerManaged(WorkspaceIntegrationId),
		workspaceId: Model.ServerManaged(WorkspaceId),
		createdByWorkspaceMemberId: Model.ServerManaged(WorkspaceMemberId),
		provider: Model.ClientProvided(
			Schema.Literal("float").pipe(
				Schema.brand("WorkspaceIntegrationProvider"),
			),
		),
		apiKey: Model.Field({
			select: EncryptedApiKey,
			insert: EncryptedApiKey,
			update: EncryptedApiKey,
			jsonCreate: PlainApiKey,
			jsonUpdate: Schema.optionalKey(PlainApiKey),
		}),
		_metadata: Model.ServerManaged(
			Schema.Option(
				Schema.Struct({
					lastSyncedAt: Schema.optionalKey(Schema.DateTimeUtcFromDate),
				}),
			),
		),
		createdAt: Model.SystemGenerated(Schema.DateTimeUtcFromDate),
	},
	{
		identifier: "WorkspaceIntegration",
		title: "Workspace Integration",
		description: "An integration connecting a workspace to an external service",
	},
) {}
