import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";

export class PingRpc extends RpcGroup.make(
  Rpc.make("Ping", {
    success: Schema.Void,
  })
) {}
