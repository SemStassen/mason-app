import { ServiceMap } from "effect";
import type { Effect, Option } from "effect";

import type { RepositoryError } from "#shared/repository/index";

import type { Workspace } from "./domain/workspace.entity";

export interface WorkspaceRepositoryShape {
  readonly insert: (
    data: typeof Workspace.insert.Type
  ) => Effect.Effect<Workspace, RepositoryError>;
  readonly update: (params: {
    id: Workspace["id"];
    update: typeof Workspace.update.Type;
  }) => Effect.Effect<Workspace, RepositoryError>;
  readonly findById: (
    id: Workspace["id"]
  ) => Effect.Effect<Option.Option<Workspace>, RepositoryError>;
  readonly findBySlug: (
    slug: Workspace["slug"]
  ) => Effect.Effect<Option.Option<Workspace>, RepositoryError>;
}

export class WorkspaceRepository extends ServiceMap.Service<
  WorkspaceRepository,
  WorkspaceRepositoryShape
>()("@mason/workspace/WorkspaceRepository") {}
