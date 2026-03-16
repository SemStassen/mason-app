import { type Effect, Schema, ServiceMap } from "effect";
import type { RepositoryError } from "#shared/database/index";
import { WorkspaceId } from "#shared/schemas/index";
import type { Workspace } from "./domain/workspace.entity";

export class WorkspaceSlugAlreadyExistsError extends Schema.TaggedErrorClass<WorkspaceSlugAlreadyExistsError>()(
	"workspace/WorkspaceSlugAlreadyExistsError",
	{},
	{
		httpApiStatus: 409,
	},
) {}

export class WorkspaceNotFoundError extends Schema.TaggedErrorClass<WorkspaceNotFoundError>()(
	"workspace/WorkspaceNotFoundError",
	{
		workspaceId: WorkspaceId,
	},
	{
		httpApiStatus: 404,
	},
) {}

interface WorkspaceModuleShape {
	readonly createWorkspace: (
		data: typeof Workspace.jsonCreate.Type,
	) => Effect.Effect<
		Workspace,
		WorkspaceSlugAlreadyExistsError | RepositoryError
	>;
	readonly updateWorkspace: (params: {
		id: Workspace["id"];
		data: typeof Workspace.jsonUpdate.Type;
	}) => Effect.Effect<
		Workspace,
		WorkspaceNotFoundError | WorkspaceSlugAlreadyExistsError | RepositoryError
	>;
	readonly checkWorkspaceSlugAvailability: (
		slug: Workspace["slug"],
	) => Effect.Effect<boolean, RepositoryError>;
}

export class WorkspaceModule extends ServiceMap.Service<
	WorkspaceModule,
	WorkspaceModuleShape
>()("@mason/workspace/WorkspaceModule") {}
