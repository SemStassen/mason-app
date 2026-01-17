import { Effect } from "effect";
import { type CreateWorkspace, Workspace } from "../domain";
import { WorkspaceRepository } from "../repositories";
import { AssertWorkspaceSlugUniqueAction } from "./assert-slug-unique";

export type CreateWorkspaceInput = CreateWorkspace;

export type CreateWorkspaceOutput = Workspace;

export const CreateWorkspaceAction = Effect.fn(
  "workspace/CreateWorkspaceAction"
)(function* (input: CreateWorkspaceInput) {
  const workspaceRepo = yield* WorkspaceRepository;

  yield* AssertWorkspaceSlugUniqueAction({ slug: input.slug });

  const createdWorkspace = yield* Workspace.create(input);

  const [insertedWorkspace] = yield* workspaceRepo.insert({
    workspaces: [createdWorkspace],
  });

  return insertedWorkspace satisfies CreateWorkspaceOutput;
});
