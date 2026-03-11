import type { HttpApiError } from "effect/unstable/httpapi";
import { RpcMiddleware } from "effect/unstable/rpc";
import type { SessionContext, WorkspaceContext } from "~/shared/auth";

export class SessionMiddleware extends RpcMiddleware.Service<
	SessionMiddleware,
	{
		provides: SessionContext;
		requiredForClient: true;
		failure: HttpApiError.Unauthorized;
	}
>()("@mason/shared/SessionMiddleware") {}

export class WorkspaceMiddleware extends RpcMiddleware.Service<
	WorkspaceMiddleware,
	{
		provides: WorkspaceContext;
		requiredForClient: true;
		failure: HttpApiError.Forbidden;
	}
>()("@mason/shared/WorkspaceMiddleware") {}
