import { Effect } from "effect";
import { Workspace } from "../domain/workspace.entity";
import { WorkspaceRepository } from "../repositories/workspace.repo";
import { AssertWorkspaceSlugUniqueAction } from "./assert-slug-unique";

export type CreateWorkspaceInput = typeof Workspace.actionCreate.Type;

export type CreateWorkspaceOutput = Workspace;

export const CreateWorkspaceAction = Effect.fn(
  "workspace/CreateWorkspaceAction"
)(function* (input: CreateWorkspaceInput) {
  const workspaceRepo = yield* WorkspaceRepository;

  yield* AssertWorkspaceSlugUniqueAction({ slug: input.slug });

  const createdWorkspace = yield* Workspace.fromInput(input);

  const [insertedWorkspace] = yield* workspaceRepo.insert({
    workspaces: [createdWorkspace],
  });

  return insertedWorkspace satisfies CreateWorkspaceOutput;
});
