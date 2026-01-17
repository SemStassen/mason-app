import { Context, type Effect, type Option } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/infra/db";
import type { ProjectId, TaskId, WorkspaceId } from "~/shared/schemas";
import type { AtLeastOne } from "~/shared/utils";
import type { Task } from "../domain";

export class TaskRepository extends Context.Tag(
  "@mason/project/TaskRepository"
)<
  TaskRepository,
  {
    insert: (params: {
      tasks: NonEmptyReadonlyArray<Task>;
    }) => Effect.Effect<ReadonlyArray<Task>, DatabaseError>;
    update: (params: {
      workspaceId: WorkspaceId;
      tasks: NonEmptyReadonlyArray<Task>;
    }) => Effect.Effect<ReadonlyArray<Task>, DatabaseError>;
    retrieve: (params: {
      workspaceId: WorkspaceId;
      query: AtLeastOne<{
        id?: TaskId;
      }>;
    }) => Effect.Effect<Option.Option<Task>, DatabaseError>;
    list: (params: {
      workspaceId: WorkspaceId;
      query: {
        ids?: ReadonlyArray<TaskId>;
        projectId?: ProjectId;
      };
    }) => Effect.Effect<ReadonlyArray<Task>, DatabaseError>;
  }
>() {}
