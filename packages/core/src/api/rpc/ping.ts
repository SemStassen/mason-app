import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";

export const PingRpcs = RpcGroup.make(
  Rpc.make("Ping", {
    success: Schema.Struct({
      status: Schema.Literal("OK"),
      timestamp: Schema.DateTimeUtc,
    }),
  })
);
