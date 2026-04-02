import type {
  CreateWorkspaceIntegrationCommand,
  CreateWorkspaceIntegrationResult,
} from "@recount/core/contracts";
import { WorkspaceContext } from "@recount/core/shared/auth";
import { Effect } from "effect";

import { Authorization } from "#shared/authorization/index";

import { IntegrationModule } from "../integration-module.service";

export const createWorkspaceIntegrationFlow = Effect.fn(
  "flows.createWorkspaceIntegrationFlow"
)(function* (request: typeof CreateWorkspaceIntegrationCommand.Type) {
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

  return createdWorkspaceIntegration satisfies typeof CreateWorkspaceIntegrationResult.Type;
});
