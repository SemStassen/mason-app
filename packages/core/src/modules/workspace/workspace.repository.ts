import { type Effect, type Option, ServiceMap } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { RepositoryError } from "~/shared/errors";
import type { Workspace } from "./domain/workspace.entity";

export interface WorkspaceRepositoryShape {
	readonly insert: (
		data: NonEmptyReadonlyArray<typeof Workspace.insert.Type>,
	) => Effect.Effect<NonEmptyReadonlyArray<Workspace>, RepositoryError>;
	readonly update: (
		data: typeof Workspace.update.Type,
	) => Effect.Effect<Workspace, RepositoryError>;
	readonly findById: (
		id: Workspace["id"],
	) => Effect.Effect<Option.Option<Workspace>, RepositoryError>;
	readonly findBySlug: (
		slug: Workspace["slug"],
	) => Effect.Effect<Option.Option<Workspace>, RepositoryError>;
}

export class WorkspaceRepository extends ServiceMap.Service<
	WorkspaceRepository,
	WorkspaceRepositoryShape
>()("@mason/workspace/WorkspaceRepository") {}
