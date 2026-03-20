import { HttpApiError } from "effect/unstable/httpapi";
import { RpcMiddleware } from "effect/unstable/rpc";

import type { SessionContext, WorkspaceContext } from "#shared/auth/index";

export class SessionMiddleware extends RpcMiddleware.Service<
  SessionMiddleware,
  {
    provides: SessionContext;
  }
>()("@mason/shared/SessionMiddleware", {
  error: HttpApiError.Unauthorized,
  requiredForClient: true,
}) {}

export class WorkspaceMiddleware extends RpcMiddleware.Service<
  WorkspaceMiddleware,
  {
    provides: WorkspaceContext;
  }
>()("@mason/shared/WorkspaceMiddleware", {
  error: HttpApiError.Forbidden,
  requiredForClient: true,
}) {}
