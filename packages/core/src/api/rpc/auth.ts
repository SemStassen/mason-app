import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

import {
  SetLastActiveWorkspaceCommand,
  SetLastActiveWorkspaceResult,
} from "#api/contracts/index";
import { Session, User } from "#modules/identity/index";
import { WorkspaceMemberNotFoundError } from "#modules/workspace-member/workspace-member-module.service";

import { RpcSessionMiddleware } from "./middleware";

export const AuthRpcGroup = RpcGroup.make(
  Rpc.make("Auth.GetSession", {
    payload: Schema.Void,
    success: Schema.Struct({
      user: User.json,
      session: Session.json,
    }),
    error: Schema.Union([
      HttpApiError.Unauthorized,
      HttpApiError.InternalServerError,
    ]),
  }).middleware(RpcSessionMiddleware),

  Rpc.make("Auth.SetLastActiveWorkspace", {
    payload: SetLastActiveWorkspaceCommand,
    success: SetLastActiveWorkspaceResult,
    error: Schema.Union([
      WorkspaceMemberNotFoundError,
      HttpApiError.InternalServerError,
    ]),
  }).middleware(RpcSessionMiddleware)
);
