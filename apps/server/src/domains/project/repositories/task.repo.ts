import { Context, type Effect, type Option } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/shared/errors";
import type { ProjectId, TaskId, WorkspaceId } from "~/shared/schemas";
import type { Task } from "../schemas/task.model";

export class TaskRepository extends Context.Tag(
  "@mason/project/TaskRepository"
)<
  TaskRepository,
  {
    insert: (params: {
      workspaceId: WorkspaceId;
      tasks: NonEmptyReadonlyArray<Task>;
    }) => Effect.Effect<ReadonlyArray<Task>, DatabaseError>;
    update: (params: {
      workspaceId: WorkspaceId;
      tasks: NonEmptyReadonlyArray<Task>;
    }) => Effect.Effect<ReadonlyArray<Task>, DatabaseError>;
    softDelete: (params: {
      workspaceId: WorkspaceId;
      taskIds: NonEmptyReadonlyArray<TaskId>;
    }) => Effect.Effect<void, DatabaseError>;
    retrieve: (params: {
      workspaceId: WorkspaceId;
      query: {
        id?: TaskId;
        _includeDeleted?: boolean;
      };
    }) => Effect.Effect<Option.Option<Task>, DatabaseError>;
    list: (params: {
      workspaceId: WorkspaceId;
      query: {
        ids?: ReadonlyArray<TaskId>;
        projectId?: ProjectId;
        _includeDeleted?: boolean;
      };
    }) => Effect.Effect<ReadonlyArray<Task>, DatabaseError>;
  }
>() {}
