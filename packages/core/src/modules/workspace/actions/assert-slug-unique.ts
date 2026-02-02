import { Effect, Option } from "effect";
import { WorkspaceSlugAlreadyExistsError } from "../domain/errors";
import type { Workspace } from "../domain/workspace.model";
import { WorkspaceRepository } from "../repositories/workspace.repo";

export interface AssertWorkspaceSlugUniqueInput {
  slug: Workspace["slug"];
}

export type AssertWorkspaceSlugUniqueOutput = void;

export const AssertWorkspaceSlugUniqueAction = Effect.fn(
  "workspace/AssertWorkspaceSlugUniqueAction"
)(function* (input: AssertWorkspaceSlugUniqueInput) {
  const workspaceRepo = yield* WorkspaceRepository;

  const maybeWorkspace = yield* workspaceRepo.retrieve({
    query: { slug: input.slug },
  });

  if (Option.isSome(maybeWorkspace)) {
    return yield* Effect.fail(new WorkspaceSlugAlreadyExistsError());
  }
});
