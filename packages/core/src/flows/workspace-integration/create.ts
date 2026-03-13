import { Authorization } from "@mason/authorization";
import { Effect } from "effect";
import {
	IntegrationModule,
	WorkspaceIntegration,
} from "#modules/integration/index";
import { WorkspaceContext } from "#shared/auth/index";

export const CreateWorkspaceIntegrationRequest =
	WorkspaceIntegration.jsonCreate;

export const CreateWorkspaceIntegrationResponse = WorkspaceIntegration.json;

export const CreateWorkspaceIntegrationFlow = Effect.fn(
	"CreateWorkspaceIntegrationFlow",
)(function* (request: typeof CreateWorkspaceIntegrationRequest.Type) {
	const { member, workspace } = yield* WorkspaceContext;

	const authz = yield* Authorization;

	const integrationModule = yield* IntegrationModule;

	yield* authz.ensureAllowed({
		action: "workspace:create_integration",
		role: member.role,
	});

	const createdWorkspaceIntegration =
		yield* integrationModule.createWorkspaceIntegration({
			workspaceId: workspace.id,
			createdByWorkspaceMemberId: member.id,
			data: request,
		});

	return createdWorkspaceIntegration satisfies typeof CreateWorkspaceIntegrationResponse.Type;
});
