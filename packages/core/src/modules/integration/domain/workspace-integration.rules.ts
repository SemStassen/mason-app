import { Effect, Option } from "effect";
import type { WorkspaceId } from "~/shared/schemas";
import { WorkspaceIntegrationRepository } from "../repositories/workspace-integration.repo";
import { WorkspaceIntegrationProviderAlreadyExistsError } from "./errors";
import type { WorkspaceIntegration } from "./workspace-integration.model";

export const assertUniqueWorkspaceIntegrationProvider = Effect.fn(
  "integration/AssertUniqueWorkspaceIntegrationProvider"
)(function* (input: {
  workspaceId: WorkspaceId;
  provider: WorkspaceIntegration["provider"];
}) {
  const workspaceIntegrationRepo = yield* WorkspaceIntegrationRepository;

  const maybeWorkspaceIntegration = yield* workspaceIntegrationRepo.retrieve({
    workspaceId: input.workspaceId,
    query: {
      provider: input.provider,
    },
  });

  if (Option.isSome(maybeWorkspaceIntegration)) {
    return yield* Effect.fail(
      new WorkspaceIntegrationProviderAlreadyExistsError()
    );
  }
});
