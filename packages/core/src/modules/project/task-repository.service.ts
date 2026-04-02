import { ServiceMap } from "effect";
import type { Effect, Option } from "effect";

import type { RepositoryError } from "#shared/repository/index";

import type { Task } from "./domain/task.entity";

export interface TaskRepositoryShape {
  readonly insertMany: (
    data: ReadonlyArray<typeof Task.insert.Type>
  ) => Effect.Effect<ReadonlyArray<Task>, RepositoryError>;
  readonly update: (params: {
    workspaceId: Task["workspaceId"];
    id: Task["id"];
    update: typeof Task.update.Type;
  }) => Effect.Effect<Task, RepositoryError>;
  readonly archiveMany: (params: {
    workspaceId: Task["workspaceId"];
    ids: ReadonlyArray<Task["id"]>;
  }) => Effect.Effect<ReadonlyArray<Task>, RepositoryError>;
  readonly restoreMany: (params: {
    workspaceId: Task["workspaceId"];
    ids: ReadonlyArray<Task["id"]>;
  }) => Effect.Effect<ReadonlyArray<Task>, RepositoryError>;
  readonly findById: (params: {
    workspaceId: Task["workspaceId"];
    id: Task["id"];
  }) => Effect.Effect<Option.Option<Task>, RepositoryError>;
}

export class TaskRepository extends ServiceMap.Service<
  TaskRepository,
  TaskRepositoryShape
>()("@recount/project/TaskRepository") {}
