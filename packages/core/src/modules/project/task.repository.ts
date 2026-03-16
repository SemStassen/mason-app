import { type Effect, type Option, ServiceMap } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { RepositoryError } from "#shared/database/index";
import type { Task } from "./domain/task.entity";

export interface TaskRepositoryShape {
	readonly insertMany: (
		data: ReadonlyArray<typeof Task.insert.Type>,
	) => Effect.Effect<ReadonlyArray<Task>, RepositoryError>;
	readonly update: (params: {
		id: Task["id"];
		workspaceId: Task["workspaceId"];
		update: typeof Task.update.Type;
	}) => Effect.Effect<Task, RepositoryError>;
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
