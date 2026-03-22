import { MasonApi } from "@mason/core/http";
import { DateTime, Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

export const PingHttpGroupLayer = HttpApiBuilder.group(
  MasonApi,
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
