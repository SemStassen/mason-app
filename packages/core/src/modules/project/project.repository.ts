import { type Effect, type Option, ServiceMap } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { RepositoryError } from "#shared/database/index";
import type { Project } from "./domain/project.entity";

export interface ProjectRepositoryShape {
	readonly insertMany: (
		data: ReadonlyArray<typeof Project.insert.Type>,
	) => Effect.Effect<ReadonlyArray<Project>, RepositoryError>;
	readonly update: (params: {
		id: Project["id"];
		workspaceId: Project["workspaceId"];
		update: typeof Project.update.Type;
	}) => Effect.Effect<Project, RepositoryError>;
	readonly archive: (params: {
		workspaceId: Project["workspaceId"];
		projectIds: NonEmptyReadonlyArray<Project["id"]>;
	}) => Effect.Effect<void, RepositoryError>;
	readonly restore: (params: {
		workspaceId: Project["workspaceId"];
		projectIds: NonEmptyReadonlyArray<Project["id"]>;
	}) => Effect.Effect<void, RepositoryError>;
	readonly findById: (params: {
		workspaceId: Project["workspaceId"];
		id: Project["id"];
	}) => Effect.Effect<Option.Option<Project>, RepositoryError>;
	readonly findManyByIds: (params: {
		workspaceId: Project["workspaceId"];
		ids: ReadonlyArray<Project["id"]>;
	}) => Effect.Effect<ReadonlyArray<Project>, RepositoryError>;
}

export class ProjectRepository extends ServiceMap.Service<
	ProjectRepository,
	ProjectRepositoryShape
>()("@mason/project/ProjectRepository") {}
