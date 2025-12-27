import { RpcMiddleware } from "@effect/rpc";
import { ExistingUserId } from "@mason/types";
import { Context, Schema } from "effect";

export class AuthData extends Schema.Class<AuthData>(
  "@mason/api-contract/authData"
)({
  userId: ExistingUserId,
}) {}

/**
 * Context tag which represents the authenticated user.
 */
export class AuthContext extends Context.Tag("@mason/api-contract/AuthContext")<
  AuthContext,
  AuthData
>() {}

/**
 * RPC middleware for authentication.
 * Provides AuthContext to RPC handlers.
 * Requires client implementation for sending auth tokens.
 */
export class AuthMiddleware extends RpcMiddleware.Tag<AuthMiddleware>()(
  "@mason/api-contract/AuthMiddleware",
  {
    // This middleware will provide the authenticated user context
    provides: AuthContext,
    // This middleware requires a client implementation too (for sending auth tokens)
    requiredForClient: true,
  }
) {}
