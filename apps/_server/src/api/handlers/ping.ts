import { HttpApiBuilder, HttpServerResponse } from "@effect/platform";
import { MasonApi } from "@mason/api-contract";
import { Effect } from "effect";

export const PingGroupLive = HttpApiBuilder.group(
  MasonApi,
  "Ping",
  (handlers) =>
    Effect.gen(function* () {
      return handlers.handle("Ping", () => HttpServerResponse.text("pong"));
    })
);
