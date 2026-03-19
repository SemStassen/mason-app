import { SessionMiddleware } from "@mason/core/rpc";
import { Effect, Layer } from "effect";

export const SessionMiddlewareLayer = Layer.effect(
  SessionMiddleware,
  Effect.succeed((_effect, _options) =>
    Effect.die("Session middleware not implemented")
  )
);
