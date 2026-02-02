import { InternalServerError } from "@effect/platform/HttpApiError";
import { Rpc, RpcGroup } from "@effect/rpc";
import { AuthorizationError } from "@mason/authorization";
import { Schema } from "effect";
import {
  ArchiveTaskRequest,
  CreateTaskRequest,
  PatchTaskRequest,
  RestoreTaskRequest,
} from "~/flows";
import { ProjectArchivedError } from "~/modules/project/domain/errors";
import { SessionMiddleware, WorkspaceMiddleware } from "./middleware";

export const TaskRpcs = RpcGroup.make(
  Rpc.make("Task.Create", {
    payload: CreateTaskRequest,
    success: Schema.Void,
    error: Schema.Union(
      AuthorizationError,
      ProjectArchivedError,
      InternalServerError
    ),
  })
    .middleware(SessionMiddleware)
    .middleware(WorkspaceMiddleware),
  Rpc.make("Task.Patch", {
    payload: PatchTaskRequest,
    success: Schema.Void,
    error: Schema.Union(
      AuthorizationError,
      ProjectArchivedError,
      InternalServerError
    ),
  })
    .middleware(SessionMiddleware)
    .middleware(WorkspaceMiddleware),
  Rpc.make("Task.Archive", {
    payload: ArchiveTaskRequest,
    success: Schema.Void,
    error: Schema.Union(
      AuthorizationError,
      ProjectArchivedError,
      InternalServerError
    ),
  })
    .middleware(SessionMiddleware)
    .middleware(WorkspaceMiddleware),
  Rpc.make("Task.Restore", {
    payload: RestoreTaskRequest,
    success: Schema.Void,
    error: Schema.Union(
      AuthorizationError,
      ProjectArchivedError,
      InternalServerError
    ),
  })
    .middleware(SessionMiddleware)
    .middleware(WorkspaceMiddleware)
);
