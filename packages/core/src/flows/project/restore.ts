import { Authorization } from "@mason/authorization";
import { Effect, Schema } from "effect";
import { ProjectModule } from "#modules/project/index";
import { WorkspaceContext } from "#shared/auth/index";
import { ProjectId } from "#shared/schemas/index";

export const RestoreProjectRequest = Schema.Struct({
	id: ProjectId,
});

export const RestoreProjectResponse = Schema.Void;

export const RestoreProjectFlow = Effect.fn("flows/RestoreProjectFlow")(
	function* (request: typeof RestoreProjectRequest.Type) {
		const { member, workspace } = yield* WorkspaceContext;

		const authz = yield* Authorization;

		const projectModule = yield* ProjectModule;

		yield* authz.ensureAllowed({
			action: "project:restore",
			role: member.role,
		});

		yield* projectModule.restoreProject({
			id: request.id,
			workspaceId: workspace.id,
		});

		return undefined satisfies typeof RestoreProjectResponse.Type;
	},
);
