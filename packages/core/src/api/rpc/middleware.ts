import { HttpApiError } from "effect/unstable/httpapi";
import { RpcMiddleware } from "effect/unstable/rpc";

import type { SessionContext, WorkspaceContext } from "#shared/auth/index";

export class SessionMiddleware extends RpcMiddleware.Service<
  SessionMiddleware,
  {
    provides: SessionContext;
  }
>()("@mason/core/rpc/SessionMiddleware", {
  error: HttpApiError.Unauthorized,
  requiredForClient: true,
}) {}

export class WorkspaceMiddleware extends RpcMiddleware.Service<
  WorkspaceMiddleware,
  {
    provides: WorkspaceContext;
  }
>()("@mason/core/rpc/WorkspaceMiddleware", {
  error: HttpApiError.Forbidden,
  requiredForClient: false,
}) {}
