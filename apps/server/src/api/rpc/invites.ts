import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";

export const InvitesRpc = RpcGroup.make(
  Rpc.make("InviteUserToWorkspace", {
    payload: Schema.Struct({
      email: Schema.String,
    }),
    success: Schema.Void,
  })
);
