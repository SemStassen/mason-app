import { Option, Result } from "effect";
import { TaskId } from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";
import { Task } from "./task.entity";

export const createTask = (params: {
	workspaceId: Task["workspaceId"];
	data: typeof Task.jsonCreate.Type;
}): Result.Result<Task, never> =>
	Result.succeed(
		Task.make({
			id: TaskId.makeUnsafe(generateUUID()),
			workspaceId: params.workspaceId,
			projectId: params.data.projectId,
			name: params.data.name,
			archivedAt: Option.none(),
		}),
	);

export const updateTask = (params: {
	task: Task;
	data: typeof Task.jsonUpdate.Type;
}): Result.Result<Task, never> =>
	Result.succeed(
		Task.make({
			...params.task,
			...params.data,
		}),
	);
