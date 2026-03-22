import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

import { Session, User } from "#modules/identity/index";
import { AuthorizationError } from "#shared/authorization/index";

import { SessionMiddleware } from "./middleware";

export const AuthRpcGroup = RpcGroup.make(
  Rpc.make("Auth.GetSession", {
    payload: Schema.Void,
    success: Schema.Struct({
      user: User.json,
      session: Session.json,
    }),
    error: Schema.Union([AuthorizationError, HttpApiError.InternalServerError]),
  }).middleware(SessionMiddleware)
);
