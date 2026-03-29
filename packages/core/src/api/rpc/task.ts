import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

import {
  ArchiveTaskCommand,
  ArchiveTaskResult,
  CreateTaskCommand,
  CreateTaskResult,
  RestoreTaskCommand,
  RestoreTaskResult,
  UpdateTaskCommand,
  UpdateTaskResult,
} from "#api/contracts/index";
import {
  ProjectArchivedError,
  ProjectNotFoundError,
  TaskNotFoundError,
} from "#modules/project/index";
import { AuthorizationError } from "#shared/authorization/index";

import { RpcSessionMiddleware, RpcWorkspaceMiddleware } from "./middleware";

export const TaskRpcGroup = RpcGroup.make(
  Rpc.make("Task.Create", {
    payload: CreateTaskCommand,
    success: CreateTaskResult,
    error: Schema.Union([
      AuthorizationError,
      ProjectNotFoundError,
      ProjectArchivedError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcSessionMiddleware)
    .middleware(RpcWorkspaceMiddleware),

  Rpc.make("Task.Update", {
    payload: UpdateTaskCommand,
    success: UpdateTaskResult,
    error: Schema.Union([
      AuthorizationError,
      TaskNotFoundError,
      ProjectNotFoundError,
      ProjectArchivedError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcSessionMiddleware)
    .middleware(RpcWorkspaceMiddleware),

  Rpc.make("Task.Archive", {
    payload: ArchiveTaskCommand,
    success: ArchiveTaskResult,
    error: Schema.Union([
      AuthorizationError,
      TaskNotFoundError,
      ProjectNotFoundError,
      ProjectArchivedError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcSessionMiddleware)
    .middleware(RpcWorkspaceMiddleware),

  Rpc.make("Task.Restore", {
    payload: RestoreTaskCommand,
    success: RestoreTaskResult,
    error: Schema.Union([
      AuthorizationError,
      TaskNotFoundError,
      ProjectNotFoundError,
      ProjectArchivedError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcSessionMiddleware)
    .middleware(RpcWorkspaceMiddleware)
);
