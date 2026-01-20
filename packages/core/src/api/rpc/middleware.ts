import { Forbidden, Unauthorized } from "@effect/platform/HttpApiError";
import { RpcMiddleware } from "@effect/rpc";
import { SessionContext, WorkspaceContext } from "~/shared/auth";

export class SessionMiddleware extends RpcMiddleware.Tag<SessionMiddleware>()(
  "@mason/shared/SessionMiddleware",
  {
    provides: SessionContext,
    requiredForClient: true,
    failure: Unauthorized,
  }
) {}

export class WorkspaceMiddleware extends RpcMiddleware.Tag<WorkspaceMiddleware>()(
  "@mason/shared/WorkspaceMiddleware",
  {
    provides: WorkspaceContext,
    requiredForClient: true,
    failure: Forbidden,
  }
) {}
