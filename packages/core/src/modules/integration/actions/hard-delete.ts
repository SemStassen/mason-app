import { Effect, Option } from "effect";
import type { WorkspaceId, WorkspaceIntegrationId } from "~/shared/schemas";
import { WorkspaceIntegrationNotFoundError } from "../errors";
import { WorkspaceIntegrationRepository } from "../repositories";

export interface HardDeleteWorkspaceIntegrationInput {
  id: WorkspaceIntegrationId;
  workspaceId: WorkspaceId;
}

export type HardDeleteWorkspaceIntegrationOutput = void;

export const HardDeleteWorkspaceIntegrationAction = Effect.fn(
  "integration/HardDeleteWorkspaceIntegrationAction"
)(function* (input: HardDeleteWorkspaceIntegrationInput) {
  const workspaceIntegrationRepo = yield* WorkspaceIntegrationRepository;

  const workspaceIntegration = yield* workspaceIntegrationRepo
    .retrieve({
      workspaceId: input.workspaceId,
      query: {
        id: input.id,
      },
    })
    .pipe(
      Effect.map(
        Option.getOrThrowWith(() => new WorkspaceIntegrationNotFoundError())
      )
    );

  yield* workspaceIntegrationRepo.hardDelete({
    workspaceId: input.workspaceId,
    ids: [workspaceIntegration.id],
  });
});
