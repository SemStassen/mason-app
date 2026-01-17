import { Context, type Effect, type Option } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/infra/db";
import type { WorkspaceId } from "~/shared/schemas";
import type { AtLeastOne } from "~/shared/utils";
import type { Workspace } from "../domain/workspace.model";

export class WorkspaceRepository extends Context.Tag(
  "@mason/workspace/WorkspaceRepository"
)<
  WorkspaceRepository,
  {
    insert: (params: {
      workspaces: NonEmptyReadonlyArray<Workspace>;
    }) => Effect.Effect<ReadonlyArray<Workspace>, DatabaseError>;
    update: (params: {
      workspaces: NonEmptyReadonlyArray<Workspace>;
    }) => Effect.Effect<ReadonlyArray<Workspace>, DatabaseError>;
    retrieve: (params: {
      query: AtLeastOne<{
        id: WorkspaceId;
        slug: string;
      }>;
    }) => Effect.Effect<Option.Option<Workspace>, DatabaseError>;
    hardDelete: (params: {
      workspaceIds: NonEmptyReadonlyArray<WorkspaceId>;
    }) => Effect.Effect<void, DatabaseError>;
  }
>() {}
