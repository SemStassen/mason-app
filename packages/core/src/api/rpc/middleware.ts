import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { RpcMiddleware } from "effect/unstable/rpc";

import type { SessionContext, WorkspaceContext } from "#shared/auth/index";

export class RpcSessionMiddleware extends RpcMiddleware.Service<
  RpcSessionMiddleware,
  {
    provides: SessionContext;
  }
>()("@recount/core/RpcSessionMiddleware", {
  error: Schema.Union([
    HttpApiError.Unauthorized,
    HttpApiError.InternalServerError,
  ]),
  requiredForClient: true,
}) {}

export class RpcWorkspaceMiddleware extends RpcMiddleware.Service<
  RpcWorkspaceMiddleware,
  {
    provides: WorkspaceContext;
    requires: RpcSessionMiddleware;
  }
>()("@recount/core/RpcWorkspaceMiddleware", {
  error: Schema.Union([
    HttpApiError.Unauthorized,
    HttpApiError.Forbidden,
    HttpApiError.InternalServerError,
  ]),
  requiredForClient: false,
}) {}
