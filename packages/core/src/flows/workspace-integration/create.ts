import { AuthorizationService } from "@mason/authorization";
import { Effect } from "effect";
import {
  IntegrationActionsService,
  WorkspaceIntegration,
} from "~/modules/integration";
import { WorkspaceContext } from "~/shared/auth";

export const CreateWorkspaceIntegrationRequest =
  WorkspaceIntegration.createInput;

export const CreateWorkspaceIntegrationFlow = Effect.fn(
  "CreateWorkspaceIntegrationFlow"
)(function* (request: typeof CreateWorkspaceIntegrationRequest.Type) {
  const { member, workspace } = yield* WorkspaceContext;

  const authz = yield* AuthorizationService;

  const integrationActions = yield* IntegrationActionsService;

  yield* authz.ensureAllowed({
    action: "workspace:create_integration",
    role: member.role,
  });

  yield* integrationActions.createWorkspaceIntegration({
    ...request,
    createdByMemberId: member.id,
    workspaceId: workspace.id,
  });
});
