import { Authorization } from "@mason/authorization";
import { Effect, Schema } from "effect";
import { ProjectModule } from "~/modules/project";
import { WorkspaceContext } from "~/shared/auth";
import { TaskId } from "~/shared/schemas";

export const RestoreTaskRequest = Schema.Struct({
	id: TaskId,
});

export const RestoreTaskResponse = Schema.Void;

export const RestoreTaskFlow = Effect.fn("flows/RestoreTaskFlow")(function* (
	request: typeof RestoreTaskRequest.Type,
) {
	const { member, workspace } = yield* WorkspaceContext;

	const authz = yield* Authorization;

	const projectModule = yield* ProjectModule;

	yield* authz.ensureAllowed({
		action: "project:restore_task",
		role: member.role,
	});

	yield* projectModule.restoreTask({
		id: request.id,
		workspaceId: workspace.id,
	});
});
