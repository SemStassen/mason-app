import { Effect } from "effect";
import type { WorkspaceId, WorkspaceIntegrationId } from "~/shared/schemas";
import type { WorkspaceIntegration } from "../domain";
import { WorkspaceIntegrationRepository } from "../repositories";

export interface ListWorkspaceIntegrationsInput {
  workspaceId: WorkspaceId;
  query: {
    ids?: ReadonlyArray<WorkspaceIntegrationId>;
  };
}

export type ListWorkspaceIntegrationsOutput =
  ReadonlyArray<WorkspaceIntegration>;

export const ListWorkspaceIntegrationsAction = Effect.fn(
  "integration/ListWorkspaceIntegrationsAction"
)(function* (input: ListWorkspaceIntegrationsInput) {
  const workspaceIntegrationRepo = yield* WorkspaceIntegrationRepository;

  const workspaceIntegrations = yield* workspaceIntegrationRepo.list({
    workspaceId: input.workspaceId,
    query: input.query,
  });

  return workspaceIntegrations;
});
