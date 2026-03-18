import { WorkspaceMiddleware } from "@mason/core/rpc";
import { Effect, Layer } from "effect";

export const WorkspaceMiddlewareLayer = Layer.effect(
  WorkspaceMiddleware,
  Effect.gen(function* () {
    return {};
  })
);
