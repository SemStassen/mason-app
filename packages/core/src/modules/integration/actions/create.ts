import { Effect } from "effect";
import {
  assertUniqueWorkspaceIntegrationProvider,
  WorkspaceIntegration,
} from "../domain";
import { WorkspaceIntegrationRepository } from "../repositories";

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
