import { Effect, type Option } from "effect";
import type { WorkspaceId } from "~/shared/schemas";
import type { AtLeastOne } from "~/shared/utils";
import type { Workspace } from "../domain/workspace.model";
import { WorkspaceRepository } from "../repositories/workspace.repo";

export interface RetrieveWorkspaceInput {
  query: AtLeastOne<{
    id: WorkspaceId;
    slug: Workspace["slug"];
  }>;
}

export type RetrieveWorkspaceOutput = Option.Option<Workspace>;

export const RetrieveWorkspaceAction = Effect.fn(
  "workspace/RetrieveWorkspaceAction"
)(function* (input: RetrieveWorkspaceInput) {
  const workspaceRepo = yield* WorkspaceRepository;

  const maybeWorkspace = yield* workspaceRepo.retrieve({
    query: input.query,
  });

  return maybeWorkspace;
});
