import { type Effect, type Option, ServiceMap } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { RepositoryError } from "~/shared/errors";
import type { Task } from "./domain/task.entity";

export interface TaskRepositoryShape {
	readonly insert: (
		data: NonEmptyReadonlyArray<typeof Task.insert.Type>,
	) => Effect.Effect<NonEmptyReadonlyArray<Task>, RepositoryError>;
	readonly update: (
		data: typeof Task.update.Type,
	) => Effect.Effect<Task, RepositoryError>;
	readonly archive: (params: {
		workspaceId: Task["workspaceId"];
		timeEntryIds: NonEmptyReadonlyArray<Task["id"]>;
	}) => Effect.Effect<void, RepositoryError>;
	readonly restore: (params: {
		workspaceId: Task["workspaceId"];
		projectIds: NonEmptyReadonlyArray<Task["id"]>;
	}) => Effect.Effect<void, RepositoryError>;
	readonly findById: (params: {
		workspaceId: Task["workspaceId"];
		id: Task["id"];
	}) => Effect.Effect<Option.Option<Task>, RepositoryError>;
}

export class TaskRepository extends ServiceMap.Service<
	TaskRepository,
	TaskRepositoryShape
>()("@mason/project/TaskRepository") {}
