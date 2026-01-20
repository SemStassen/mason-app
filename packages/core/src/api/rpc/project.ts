import { InternalServerError } from "@effect/platform/HttpApiError";
import { Rpc, RpcGroup } from "@effect/rpc";
import { AuthorizationError } from "@mason/authorization";
import { Schema } from "effect";
import {
  ArchiveProjectRequest,
  CreateProjectRequest,
  PatchProjectRequest,
  RestoreProjectRequest,
} from "~/flows";
import { SessionMiddleware, WorkspaceMiddleware } from "./middleware";

export const ProjectRpcs = RpcGroup.make(
  Rpc.make("Project.Create", {
    payload: CreateProjectRequest,
    success: Schema.Void,
    error: Schema.Union(AuthorizationError, InternalServerError),
  })
    .middleware(SessionMiddleware)
    .middleware(WorkspaceMiddleware),
  Rpc.make("Project.Patch", {
    payload: PatchProjectRequest,
    success: Schema.Void,
    error: Schema.Union(AuthorizationError, InternalServerError),
  })
    .middleware(SessionMiddleware)
    .middleware(WorkspaceMiddleware),
  Rpc.make("Project.Archive", {
    payload: ArchiveProjectRequest,
    success: Schema.Void,
    error: Schema.Union(AuthorizationError, InternalServerError),
  })
    .middleware(SessionMiddleware)
    .middleware(WorkspaceMiddleware),
  Rpc.make("Project.Restore", {
    payload: RestoreProjectRequest,
    success: Schema.Void,
    error: Schema.Union(AuthorizationError, InternalServerError),
  })
    .middleware(SessionMiddleware)
    .middleware(WorkspaceMiddleware)
);
