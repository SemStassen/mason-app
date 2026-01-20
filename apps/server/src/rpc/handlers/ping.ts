import { PingRpcs } from "@mason/core";
import { DateTime, Effect } from "effect";

export const PingRpcsLive = PingRpcs.toLayer({
  Ping: () =>
    Effect.gen(function* () {
      const currentDateTime = yield* DateTime.now;
      return {
        status: "OK",
        timestamp: currentDateTime,
      };
    }),
});
