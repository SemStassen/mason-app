import { RpcMiddleware } from "@effect/rpc";
import { Context } from "effect";
import type { User } from "~/domains/identity";
import type { Member } from "~/domains/member";
import type { Workspace } from "~/domains/workspace";

export class AuthContext extends Context.Tag("@mason/infra/AuthContext")<
  AuthContext,
  {
    currentSession: {
      id: string;
      createdAt: string;
      updatedAt: string;
      userId: string;
      expiresAt: string;
      token: string;
      ipAddress: string | null;
      userAgent: string | null;
    };
    currentUser: {
      id: User["id"];
      email: User["email"];
      emailVerified: User["emailVerified"];
      displayName: User["displayName"];
    };
  }
>() {}

/**
 * RPC middleware for authentication.
 * Provides AuthContext to RPC handlers.
 * Requires client implementation for sending auth tokens.
 */
export class AuthMiddleware extends RpcMiddleware.Tag<AuthMiddleware>()(
  "@mason/infra/AuthMiddleware",
  {
    optional: false,
    provides: AuthContext,
    requiredForClient: true,
  }
) {}

export class CurrentMemberContext extends Context.Tag(
  "@mason/infra/CurrentMemberContext"
)<
  CurrentMemberContext,
  {
    currentMember: {
      id: Member["id"];
      role: Member["role"];
    };
    currentWorkspace: {
      id: Workspace["id"];
      name: Workspace["name"];
      slug: Workspace["slug"];
    };
  }
>() {}

export class CurrentMemberMiddleware extends RpcMiddleware.Tag<CurrentMemberMiddleware>()(
  "@mason/infra/CurrentMemberMiddleware",
  {
    optional: false,
    provides: CurrentMemberContext,
    requiredForClient: true,
  }
) {}
