import { SessionMiddleware } from "@mason/core/rpc";
import { Effect, Layer } from "effect";

export const SessionMiddlewareLayer = Layer.effect(
  SessionMiddleware,
  Effect.gen(function* () {
    return {};
  })
);
