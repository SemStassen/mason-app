import { Authorization } from "@mason/authorization";
import { Effect, Schema } from "effect";
import { ProjectModule, Task } from "#modules/project/index";
import { WorkspaceContext } from "#shared/auth/index";
import { TaskId } from "#shared/schemas/index";

export const UpdateTaskRequest = Schema.Struct({
	id: TaskId,
	data: Task.jsonUpdate,
});

export const UpdateTaskResponse = Task.json;

export const UpdateTaskFlow = Effect.fn("flows/UpdateTaskFlow")(function* (
	request: typeof UpdateTaskRequest.Type,
) {
	const { member, workspace } = yield* WorkspaceContext;

	const authz = yield* Authorization;

	const projectModule = yield* ProjectModule;

	yield* authz.ensureAllowed({
		action: "project:patch_task",
		role: member.role,
	});

	const updatedTask = yield* projectModule.updateTask({
		id: request.id,
		workspaceId: workspace.id,
		data: request.data,
	});

	return updatedTask satisfies typeof UpdateTaskResponse.Type;
});
