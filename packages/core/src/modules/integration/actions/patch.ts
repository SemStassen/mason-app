import { Effect, Option } from "effect";
import type { WorkspaceId, WorkspaceIntegrationId } from "~/shared/schemas";
import type { WorkspaceIntegration } from "../domain/workspace-integration.model";
import { WorkspaceIntegrationNotFoundError } from "../errors";
import { WorkspaceIntegrationRepository } from "../repositories/workspace-integration.repo";

export interface PatchWorkspaceIntegrationInput {
  id: WorkspaceIntegrationId;
  workspaceId: WorkspaceId;
  patch: typeof WorkspaceIntegration.patch.Type;
}

export type PatchWorkspaceIntegrationOutput = void;

export const PatchWorkspaceIntegrationAction = Effect.fn(
  "integration/PatchWorkspaceIntegrationAction"
)(function* (input: PatchWorkspaceIntegrationInput) {
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

  const updatedWorkspaceIntegration = yield* workspaceIntegration.patch(
    input.patch
  );

  yield* workspaceIntegrationRepo.update({
    workspaceId: input.workspaceId,
    workspaceIntegrations: [updatedWorkspaceIntegration],
  });
});
