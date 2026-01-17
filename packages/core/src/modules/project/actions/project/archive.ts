import { Effect, Option } from "effect";
import type { ProjectId, WorkspaceId } from "~/shared/schemas";
import { ProjectNotFoundError } from "../../errors";
import { ProjectRepository } from "../../repositories";

export interface ArchiveProjectInput {
  id: ProjectId;
  workspaceId: WorkspaceId;
}

export type ArchiveProjectOutput = void;

export const ArchiveProjectAction = Effect.fn("project/ArchiveProjectAction")(
  function* (input: ArchiveProjectInput) {
    const projectRepo = yield* ProjectRepository;

    const project = yield* projectRepo
      .retrieve({
        workspaceId: input.workspaceId,
        query: { id: input.id },
      })
      .pipe(
        Effect.map(Option.getOrThrowWith(() => new ProjectNotFoundError()))
      );

    const archivedProject = yield* project.archive();

    yield* projectRepo.update({
      workspaceId: input.workspaceId,
      projects: [archivedProject],
    });
  }
);
