import { Effect, Option } from "effect";
import type { WorkspaceId } from "~/shared/schemas";
import type { Workspace } from "../domain/workspace.model";
import { WorkspaceNotFoundError } from "../errors";
import { WorkspaceRepository } from "../repositories/workspace.repo";
import { AssertWorkspaceSlugUniqueAction } from "./assert-slug-unique";

export interface PatchWorkspaceInput {
  id: WorkspaceId;
  patch: typeof Workspace.patch.Type;
}

export type PatchWorkspaceOutput = void;

export const PatchWorkspaceAction = Effect.fn("workspace/PatchWorkspaceAction")(
  function* (input: PatchWorkspaceInput) {
    const workspaceRepo = yield* WorkspaceRepository;

    const workspace = yield* workspaceRepo
      .retrieve({
        query: { id: input.id },
      })
      .pipe(
        Effect.map(Option.getOrThrowWith(() => new WorkspaceNotFoundError()))
      );

    if (input.patch.slug) {
      yield* AssertWorkspaceSlugUniqueAction({ slug: input.patch.slug });
    }

    const updated = yield* workspace.patch(input.patch);

    yield* workspaceRepo.update({ workspaces: [updated] });
  }
);
