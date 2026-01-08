import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";

export const PingRpc = RpcGroup.make(
  Rpc.make("Ping", {
    success: Schema.Void,
  })
);
