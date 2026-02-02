import { Effect, Option } from "effect";
import type { ProjectId, WorkspaceId } from "~/shared/schemas";
import type { Project } from "../../domain/project.model";
import { ProjectNotFoundError } from "../../errors";
import { ProjectRepository } from "../../repositories/project.repo";

export interface PatchProjectInput {
  id: ProjectId;
  workspaceId: WorkspaceId;
  patch: typeof Project.patch.Type;
}

export type PatchProjectOutput = void;

export const PatchProjectAction = Effect.fn("project/PatchProjectAction")(
  function* (input: PatchProjectInput) {
    const projectRepo = yield* ProjectRepository;

    const project = yield* projectRepo
      .retrieve({
        workspaceId: input.workspaceId,
        query: { id: input.id },
      })
      .pipe(
        Effect.map(Option.getOrThrowWith(() => new ProjectNotFoundError()))
      );

    const updatedProject = yield* project.patch(input.patch);

    yield* projectRepo.update({
      workspaceId: input.workspaceId,
      projects: [updatedProject],
    });
  }
);
