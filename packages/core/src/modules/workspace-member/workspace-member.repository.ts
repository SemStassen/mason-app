import { type Effect, type Option, ServiceMap } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { RepositoryError } from "~/shared/errors";
import type { WorkspaceMember } from "./domain/workspace-member.entity";

export interface WorkspaceMemberRepositoryShape {
	readonly insert: (
		data: NonEmptyReadonlyArray<typeof WorkspaceMember.insert.Type>,
	) => Effect.Effect<NonEmptyReadonlyArray<WorkspaceMember>, RepositoryError>;
	readonly update: (
		data: typeof WorkspaceMember.update.Type,
	) => Effect.Effect<WorkspaceMember, RepositoryError>;
	readonly findById: (
		id: WorkspaceMember["id"],
	) => Effect.Effect<Option.Option<WorkspaceMember>, RepositoryError>;
	readonly findMembership: (params: {
		workspaceId: WorkspaceMember["workspaceId"];
		userId: WorkspaceMember["userId"];
	}) => Effect.Effect<Option.Option<WorkspaceMember>, RepositoryError>;
}

export class WorkspaceMemberRepository extends ServiceMap.Service<
	WorkspaceMemberRepository,
	WorkspaceMemberRepositoryShape
>()("@mason/workspace-member/WorkspaceMemberRepository") {}
