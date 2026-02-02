import { Effect } from "effect";
import { WorkspaceIntegration } from "../domain/workspace-integration.model";
import { assertUniqueWorkspaceIntegrationProvider } from "../domain/workspace-integration.rules";
import { WorkspaceIntegrationRepository } from "../repositories/workspace-integration.repo";

export type CreateWorkspaceIntegrationInput =
  typeof WorkspaceIntegration.create.Type;

export type CreateWorkspaceIntegrationOutput = void;

export const CreateWorkspaceIntegrationAction = Effect.fn(
  "integration/CreateWorkspaceIntegration"
)(function* (input: CreateWorkspaceIntegrationInput) {
  const workspaceIntegrationRepo = yield* WorkspaceIntegrationRepository;

  yield* assertUniqueWorkspaceIntegrationProvider(input);

  const createdWorkspaceIntegration =
    yield* WorkspaceIntegration.fromInput(input);

  yield* workspaceIntegrationRepo.insert({
    workspaceIntegrations: [createdWorkspaceIntegration],
  });
});
