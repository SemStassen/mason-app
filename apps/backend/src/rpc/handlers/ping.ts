import { PingRpcGroup } from "@mason/core/rpc";
import { DateTime, Effect } from "effect";

export const PingRpcGroupLayer = PingRpcGroup.toLayer(
  Effect.gen(function* () {
    return {
      Ping: () =>
        Effect.gen(function* () {
          const now = yield* DateTime.now;

          return {
            status: "OK",
            timestamp: now,
          };
        }),
    };
  })
);
