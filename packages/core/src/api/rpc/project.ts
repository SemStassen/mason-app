import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

import {
  ArchiveProjectCommand,
  ArchiveProjectResult,
  CreateProjectCommand,
  CreateProjectResult,
  RestoreProjectCommand,
  RestoreProjectResult,
  UpdateProjectCommand,
  UpdateProjectResult,
} from "#api/contracts/index";
import {
  ProjectArchivedError,
  ProjectEndDateBeforeStartDateError,
  ProjectNotFoundError,
} from "#modules/project/index";
import { AuthorizationError } from "#shared/authorization/index";

import { RpcSessionMiddleware, RpcWorkspaceMiddleware } from "./middleware";

export const ProjectRpcGroup = RpcGroup.make(
  Rpc.make("Project.Create", {
    payload: CreateProjectCommand,
    success: CreateProjectResult,
    error: Schema.Union([
      AuthorizationError,
      ProjectEndDateBeforeStartDateError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcSessionMiddleware)
    .middleware(RpcWorkspaceMiddleware),

  Rpc.make("Project.Update", {
    payload: UpdateProjectCommand,
    success: UpdateProjectResult,
    error: Schema.Union([
      AuthorizationError,
      ProjectNotFoundError,
      ProjectArchivedError,
      ProjectEndDateBeforeStartDateError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcSessionMiddleware)
    .middleware(RpcWorkspaceMiddleware),

  Rpc.make("Project.Archive", {
    payload: ArchiveProjectCommand,
    success: ArchiveProjectResult,
    error: Schema.Union([
      AuthorizationError,
      ProjectNotFoundError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcSessionMiddleware)
    .middleware(RpcWorkspaceMiddleware),

  Rpc.make("Project.Restore", {
    payload: RestoreProjectCommand,
    success: RestoreProjectResult,
    error: Schema.Union([
      AuthorizationError,
      ProjectNotFoundError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcSessionMiddleware)
    .middleware(RpcWorkspaceMiddleware)
);
