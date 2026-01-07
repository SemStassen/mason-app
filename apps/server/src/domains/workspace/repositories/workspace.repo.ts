import { Context, type Effect, type Option } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/shared/errors";
import type { MemberId, WorkspaceId } from "~/shared/schemas";
import type { Workspace } from "../schemas/workspace.model";

export class WorkspaceRepository extends Context.Tag(
  "@mason/workspace/WorkspaceRepository"
)<
  WorkspaceRepository,
  {
    insert: (params: {
      workspaces: NonEmptyReadonlyArray<Workspace>;
    }) => Effect.Effect<ReadonlyArray<Workspace>, DatabaseError>;
    update: (params: {
      memberId: MemberId;
      workspaces: NonEmptyReadonlyArray<Workspace>;
    }) => Effect.Effect<ReadonlyArray<Workspace>, DatabaseError>;
    hardDelete: (params: {
      memberId: MemberId;
      workspaceIds: NonEmptyReadonlyArray<WorkspaceId>;
    }) => Effect.Effect<void, DatabaseError>;
    retrieve: (params: {
      memberId: MemberId;
      workspaceId: WorkspaceId;
    }) => Effect.Effect<Option.Option<Workspace>, DatabaseError>;
  }
>() {}
