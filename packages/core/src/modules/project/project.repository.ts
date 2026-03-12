import { type Effect, type Option, ServiceMap } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { RepositoryError } from "~/shared/errors";
import type { Project } from "./domain/project.entity";

export interface ProjectRepositoryShape {
	readonly insert: (
		data: NonEmptyReadonlyArray<typeof Project.insert.Type>,
	) => Effect.Effect<NonEmptyReadonlyArray<Project>, RepositoryError>;
	readonly update: (
		data: typeof Project.update.Type,
	) => Effect.Effect<Project, RepositoryError>;
	readonly archive: (params: {
		workspaceId: Project["workspaceId"];
		timeEntryIds: NonEmptyReadonlyArray<Project["id"]>;
	}) => Effect.Effect<void, RepositoryError>;
	readonly restore: (params: {
		workspaceId: Project["workspaceId"];
		projectIds: NonEmptyReadonlyArray<Project["id"]>;
	}) => Effect.Effect<void, RepositoryError>;
	readonly findById: (params: {
		workspaceId: Project["workspaceId"];
		id: Project["id"];
	}) => Effect.Effect<Option.Option<Project>, RepositoryError>;
}

export class ProjectRepository extends ServiceMap.Service<
	ProjectRepository,
	ProjectRepositoryShape
>()("@mason/project/ProjectRepository") {}
