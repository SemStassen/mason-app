import { RpcMiddleware } from "@effect/rpc";
import { Context } from "effect";
import type { AuthSession, AuthUser } from "./schema";

export class AuthContext extends Context.Tag("@mason/api-contract/AuthContext")<
  AuthContext,
  {
    session: AuthSession;
    user: AuthUser;
  }
>() {}

/**
 * RPC middleware for authentication.
 * Provides AuthContext to RPC handlers.
 * Requires client implementation for sending auth tokens.
 */
export class AuthMiddleware extends RpcMiddleware.Tag<AuthMiddleware>()(
  "@mason/api-contract/AuthMiddleware",
  {
    optional: false,
    provides: AuthContext,
    requiredForClient: true,
  }
) {}
