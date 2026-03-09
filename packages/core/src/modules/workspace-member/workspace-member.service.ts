import { type Effect, Schema, ServiceMap } from "effect";
import type { RepositoryError } from "~/shared/errors";
import type { WorkspaceMember } from "./domain/workspace-member.entity";

export class UserAlreadyWorkspaceMemberError extends Schema.TaggedErrorClass<UserAlreadyWorkspaceMemberError>()(
	"workspace-member/UserAlreadyWorkspaceMemberError",
	{},
) {}

export class UserNotWorkspaceMemberError extends Schema.TaggedErrorClass<UserNotWorkspaceMemberError>()(
	"workspace-member/UserNotWorkspaceMemberError",
	{},
) {}

interface WorkspaceMemberModuleShape {
	readonly createWorkspaceMember: (params: {
		userId: WorkspaceMember["userId"];
		workspaceId: WorkspaceMember["workspaceId"];
		role: WorkspaceMember["role"];
	}) => Effect.Effect<
		WorkspaceMember,
		UserAlreadyWorkspaceMemberError | RepositoryError
	>;
	readonly assertUserWorkspaceMember: (params: {
		workspaceId: WorkspaceMember["workspaceId"];
		userId: WorkspaceMember["userId"];
	}) => Effect.Effect<void, UserNotWorkspaceMemberError | RepositoryError>;
}

export class WorkspaceMemberModule extends ServiceMap.Service<
	WorkspaceMemberModule,
	WorkspaceMemberModuleShape
>()("@mason/workspace-member/WorkspaceMemberModule") {}
