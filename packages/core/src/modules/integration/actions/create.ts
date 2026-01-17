import { Effect } from "effect";
import {
  assertUniqueWorkspaceIntegrationProvider,
  type CreateWorkspaceIntegration,
  WorkspaceIntegration,
} from "../domain";
import { WorkspaceIntegrationRepository } from "../repositories";

export type CreateWorkspaceIntegrationInput = CreateWorkspaceIntegration;

export type CreateWorkspaceIntegrationOutput = void;

export const CreateWorkspaceIntegrationAction = Effect.fn(
  "integration/CreateWorkspaceIntegration"
)(function* (input: CreateWorkspaceIntegrationInput) {
  const workspaceIntegrationRepo = yield* WorkspaceIntegrationRepository;

  yield* assertUniqueWorkspaceIntegrationProvider(input);

  const createdWorkspaceIntegration = yield* WorkspaceIntegration.create(input);

  yield* workspaceIntegrationRepo.insert({
    workspaceIntegrations: [createdWorkspaceIntegration],
  });
});
