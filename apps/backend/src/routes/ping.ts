import { RecountApi } from "@recount/core/http";
import { DateTime, Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

export const PingHttpGroupLayer = HttpApiBuilder.group(
  RecountApi,
  "ping",
  (handlers) =>
    handlers.handle("ping", () =>
      Effect.gen(function* () {
        const now = yield* DateTime.now;

        return {
          status: "OK",
          timestamp: now,
        };
      })
    )
);
