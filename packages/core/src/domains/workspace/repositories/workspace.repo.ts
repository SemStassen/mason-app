import { Context, type Effect, type Option } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/shared/errors";
import type { WorkspaceId } from "~/shared/schemas";
import type { Workspace } from "../schemas/workspace.model";

export class WorkspaceRepository extends Context.Tag(
  "@mason/workspace/WorkspaceRepository"
)<
  WorkspaceRepository,
  {
    upsert: (params: {
      workspaces: NonEmptyReadonlyArray<Workspace>;
    }) => Effect.Effect<ReadonlyArray<Workspace>, DatabaseError>;
    hardDelete: (params: {
      workspaceIds: NonEmptyReadonlyArray<WorkspaceId>;
    }) => Effect.Effect<void, DatabaseError>;
    retrieve: (params: {
      workspaceId: WorkspaceId;
    }) => Effect.Effect<Option.Option<Workspace>, DatabaseError>;
  }
>() {}
