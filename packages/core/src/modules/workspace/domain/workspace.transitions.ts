import { Option, Result } from "effect";
import { WorkspaceId } from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";
import { Workspace } from "./workspace.entity";

export const createWorkspace = (
	data: typeof Workspace.jsonCreate.Type,
): Result.Result<Workspace, never> =>
	Result.succeed(
		Workspace.make({
			id: WorkspaceId.makeUnsafe(generateUUID()),
			name: data.name,
			slug: data.slug,
			logoUrl: data.logoUrl ?? Option.none(),
			metadata: data.metadata ?? Option.none(),
		}),
	);

export const updateWorkspace = (params: {
	workspace: Workspace;
	data: typeof Workspace.jsonUpdate.Type;
}): Result.Result<
	{ entity: Workspace; changes: typeof Workspace.update.Type },
	never
> =>
	Result.succeed({
		entity: Workspace.make({ ...params.workspace, ...params.data }),
		changes: params.data,
	});
