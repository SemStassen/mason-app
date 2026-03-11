import { type Effect, Schema, ServiceMap } from "effect";
import type { RepositoryError } from "~/shared/errors";
import type { WorkspaceMember } from "./domain/workspace-member.entity";

export class WorkspaceMemberAlreadyExistsError extends Schema.TaggedErrorClass<WorkspaceMemberAlreadyExistsError>()(
	"workspace-member/WorkspaceMemberAlreadyExistsError",
	{},
) {}

export class WorkspaceMemberNotFoundError extends Schema.TaggedErrorClass<WorkspaceMemberNotFoundError>()(
	"workspace-member/WorkspaceMemberNotFoundError",
	{},
) {}

interface WorkspaceMemberModuleShape {
	readonly createWorkspaceMember: (params: {
		userId: WorkspaceMember["userId"];
		workspaceId: WorkspaceMember["workspaceId"];
		role: WorkspaceMember["role"];
	}) => Effect.Effect<
		WorkspaceMember,
		WorkspaceMemberAlreadyExistsError | RepositoryError
	>;
	readonly assertUserWorkspaceMember: (params: {
		workspaceId: WorkspaceMember["workspaceId"];
		userId: WorkspaceMember["userId"];
	}) => Effect.Effect<void, WorkspaceMemberNotFoundError | RepositoryError>;
	readonly assertUserNotWorkspaceMember: (params: {
		workspaceId: WorkspaceMember["workspaceId"];
		userId: WorkspaceMember["userId"];
	}) => Effect.Effect<
		void,
		WorkspaceMemberAlreadyExistsError | RepositoryError
	>;
}

export class WorkspaceMemberModule extends ServiceMap.Service<
	WorkspaceMemberModule,
	WorkspaceMemberModuleShape
>()("@mason/workspace-member/WorkspaceMemberModule") {}
