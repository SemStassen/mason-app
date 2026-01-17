import { Effect, Option } from "effect";
import type { ProjectId, WorkspaceId } from "~/shared/schemas";
import { ProjectNotFoundError } from "../../errors";
import { ProjectRepository } from "../../repositories";

export interface RestoreProjectInput {
  id: ProjectId;
  workspaceId: WorkspaceId;
}

export type RestoreProjectOutput = void;

export const RestoreProjectAction = Effect.fn("project/RestoreProjectAction")(
  function* (input: RestoreProjectInput) {
    const projectRepo = yield* ProjectRepository;

    const project = yield* projectRepo
      .retrieve({
        workspaceId: input.workspaceId,
        query: { id: input.id },
      })
      .pipe(
        Effect.map(Option.getOrThrowWith(() => new ProjectNotFoundError()))
      );

    const restoredProject = yield* project.restore();

    yield* projectRepo.update({
      workspaceId: input.workspaceId,
      projects: [restoredProject],
    });
  }
);
