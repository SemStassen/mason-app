import { Schema, ServiceMap } from "effect";
import type { Effect } from "effect";

import type { RepositoryError } from "#shared/repository/index";

import { Workspace } from "./domain/workspace.entity";

export class WorkspaceSlugAlreadyExistsError extends Schema.TaggedErrorClass<WorkspaceSlugAlreadyExistsError>()(
  "workspace/WorkspaceSlugAlreadyExistsError",
  {},
  {
    httpApiStatus: 409,
  }
) {}

export class WorkspaceNotFoundError extends Schema.TaggedErrorClass<WorkspaceNotFoundError>()(
  "workspace/WorkspaceNotFoundError",
  {
    workspaceId: Workspace.fields.id,
  },
  {
    httpApiStatus: 404,
  }
) {}

interface WorkspaceModuleShape {
  readonly createWorkspace: (
    data: typeof Workspace.jsonCreate.Type
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
    slug: Workspace["slug"]
  ) => Effect.Effect<boolean, RepositoryError>;
  readonly listWorkspacesByIds: (
    ids: ReadonlyArray<Workspace["id"]>
  ) => Effect.Effect<ReadonlyArray<Workspace>, RepositoryError>;
}

export class WorkspaceModule extends ServiceMap.Service<
  WorkspaceModule,
  WorkspaceModuleShape
>()("@recount/workspace/WorkspaceModule") {}
