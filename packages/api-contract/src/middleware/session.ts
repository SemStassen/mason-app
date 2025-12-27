import { RpcMiddleware } from "@effect/rpc";
import {
  ExistingMemberId,
  ExistingUserId,
  ExistingWorkspaceId,
} from "@mason/types";
import { Context, Schema } from "effect";

export class SessionData extends Schema.Class<SessionData>(
  "@mason/api-contract/SessionData"
)({
  userId: ExistingUserId,
  memberId: ExistingMemberId,
  workspaceId: ExistingWorkspaceId,
}) {}

/**
 * Context tag which represents the current workspace session.
 * Requires AuthContext to be available first.
 */
export class SessionContext extends Context.Tag(
  "@mason/api-contract/SessionContext"
)<SessionContext, SessionData>() {}

/**
 * RPC middleware for workspace session.
 * Provides SessionContext to RPC handlers.
 * Requires AuthContext to be available (should be applied after AuthMiddleware).
 */
export class SessionMiddleware extends RpcMiddleware.Tag<SessionMiddleware>()(
  "@mason/api-contract/SessionMiddleware",
  {
    // This middleware will provide the workspace session context
    provides: SessionContext,
    // This middleware requires a client implementation too (for sending session info)
    requiredForClient: true,
  }
) {}
