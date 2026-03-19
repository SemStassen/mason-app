import { ServiceMap } from "effect";
import type { Effect, Option } from "effect";

import type { RepositoryError } from "#shared/database/index";

import type { Project } from "./domain/project.entity";

export interface ProjectRepositoryShape {
  readonly insertMany: (
    data: ReadonlyArray<typeof Project.insert.Type>
  ) => Effect.Effect<ReadonlyArray<Project>, RepositoryError>;
  readonly update: (params: {
    workspaceId: Project["workspaceId"];
    id: Project["id"];
    update: typeof Project.update.Type;
  }) => Effect.Effect<Project, RepositoryError>;
  readonly archiveMany: (params: {
    workspaceId: Project["workspaceId"];
    ids: ReadonlyArray<Project["id"]>;
  }) => Effect.Effect<ReadonlyArray<Project>, RepositoryError>;
  readonly restoreMany: (params: {
    workspaceId: Project["workspaceId"];
    ids: ReadonlyArray<Project["id"]>;
  }) => Effect.Effect<ReadonlyArray<Project>, RepositoryError>;
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
