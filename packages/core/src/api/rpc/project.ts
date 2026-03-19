import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";
import {
  ProjectArchivedError,
  ProjectEndDateBeforeStartDateError,
  ProjectNotFoundError,
} from "#modules/project/index";
import { AuthorizationError } from "#shared/authorization/index";
import {
  ArchiveProjectCommand,
  ArchiveProjectResult,
  CreateProjectCommand,
  CreateProjectResult,
  RestoreProjectCommand,
  RestoreProjectResult,
  UpdateProjectCommand,
  UpdateProjectResult,
} from "../contracts";
import { SessionMiddleware, WorkspaceMiddleware } from "./middleware";

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
    .middleware(SessionMiddleware)
    .middleware(WorkspaceMiddleware),

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
    .middleware(SessionMiddleware)
    .middleware(WorkspaceMiddleware),

  Rpc.make("Project.Archive", {
    payload: ArchiveProjectCommand,
    success: ArchiveProjectResult,
    error: Schema.Union([
      AuthorizationError,
      ProjectNotFoundError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(SessionMiddleware)
    .middleware(WorkspaceMiddleware),

  Rpc.make("Project.Restore", {
    payload: RestoreProjectCommand,
    success: RestoreProjectResult,
    error: Schema.Union([
      AuthorizationError,
      ProjectNotFoundError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(SessionMiddleware)
    .middleware(WorkspaceMiddleware)
);
