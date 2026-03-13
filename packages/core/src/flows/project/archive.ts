import { Authorization } from "@mason/authorization";
import { Effect, Schema } from "effect";
import { ProjectModule } from "#modules/project/index";
import { WorkspaceContext } from "#shared/auth/index";
import { ProjectId } from "#shared/schemas/index";

export const ArchiveProjectRequest = Schema.Struct({
	id: ProjectId,
});

export const ArchiveProjectResponse = Schema.Void;

export const ArchiveProjectFlow = Effect.fn("flows/ArchiveProjectFlow")(
	function* (request: typeof ArchiveProjectRequest.Type) {
		const { member, workspace } = yield* WorkspaceContext;

		const authz = yield* Authorization;

		const projectModule = yield* ProjectModule;

		yield* authz.ensureAllowed({
			action: "project:archive",
			role: member.role,
		});

		yield* projectModule.archiveProject({
			id: request.id,
			workspaceId: workspace.id,
		});

		return undefined satisfies typeof ArchiveProjectResponse.Type;
	},
);
