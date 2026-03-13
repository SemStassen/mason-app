import { type Effect, type Option, ServiceMap } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { RepositoryError } from "#shared/database/index";
import type { WorkspaceInvitation } from "./domain/workspace-invitation.entity";

export interface WorkspaceInvitationRepositoryShape {
	readonly insert: (
		data: NonEmptyReadonlyArray<typeof WorkspaceInvitation.insert.Type>,
	) => Effect.Effect<
		NonEmptyReadonlyArray<WorkspaceInvitation>,
		RepositoryError
	>;
	readonly update: (
		data: typeof WorkspaceInvitation.update.Type,
	) => Effect.Effect<WorkspaceInvitation, RepositoryError>;
	readonly findById: (params: {
		workspaceId: WorkspaceInvitation["workspaceId"];
		id: WorkspaceInvitation["id"];
	}) => Effect.Effect<Option.Option<WorkspaceInvitation>, RepositoryError>;
	readonly findByInvitationId: (params: {
		id: WorkspaceInvitation["id"];
	}) => Effect.Effect<Option.Option<WorkspaceInvitation>, RepositoryError>;
	readonly findActivePendingByEmail: (params: {
		workspaceId: WorkspaceInvitation["workspaceId"];
		email: WorkspaceInvitation["email"];
	}) => Effect.Effect<Option.Option<WorkspaceInvitation>, RepositoryError>;
}

export class WorkspaceInvitationRepository extends ServiceMap.Service<
	WorkspaceInvitationRepository,
	WorkspaceInvitationRepositoryShape
>()("@mason/workspace-invitation/WorkspaceInvitationRepository") {}
