import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

import { UpdateUserMeCommand, UpdateUserMeResult } from "#api/contracts/index";
import { UserNotFoundError } from "#modules/identity/identity-module.service";

import { RpcSessionMiddleware } from "./middleware";

export const UserRpcGroup = RpcGroup.make(
  Rpc.make("User.UpdateMe", {
    payload: UpdateUserMeCommand,
    success: UpdateUserMeResult,
    error: Schema.Union([UserNotFoundError, HttpApiError.InternalServerError]),
  }).middleware(RpcSessionMiddleware)
);
