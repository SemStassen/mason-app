import { Effect } from "effect";
import { Workspace } from "../domain";
import { WorkspaceRepository } from "../repositories";
import { AssertWorkspaceSlugUniqueAction } from "./assert-slug-unique";

export type CreateWorkspaceInput = typeof Workspace.create.Type;

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
