import { Effect, type Option } from "effect";
import type { WorkspaceId, WorkspaceIntegrationId } from "~/shared/schemas";
import type { AtLeastOne } from "~/shared/utils";
import type { WorkspaceIntegration } from "../domain/workspace-integration.model";
import { WorkspaceIntegrationRepository } from "../repositories/workspace-integration.repo";

export interface RetrieveWorkspaceIntegrationInput {
  workspaceId: WorkspaceId;
  query: AtLeastOne<{
    id: WorkspaceIntegrationId;
    provider: WorkspaceIntegration["provider"];
  }>;
}

export type RetrieveWorkspaceIntegrationOutput =
  Option.Option<WorkspaceIntegration>;

export const RetrieveWorkspaceIntegrationAction = Effect.fn(
  "integration/RetrieveWorkspaceIntegrationAction"
)(function* (input: RetrieveWorkspaceIntegrationInput) {
  const workspaceIntegrationRepo = yield* WorkspaceIntegrationRepository;

  const maybeWorkspaceIntegration = yield* workspaceIntegrationRepo.retrieve({
    workspaceId: input.workspaceId,
    query: input.query,
  });

  return maybeWorkspaceIntegration;
});
