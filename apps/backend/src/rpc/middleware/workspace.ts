import { WorkspaceMiddleware } from "@mason/core/rpc";
import { Effect, Layer } from "effect";

export const WorkspaceMiddlewareLayer = Layer.effect(
  WorkspaceMiddleware,
  Effect.succeed((_effect, _options) =>
    Effect.die("Workspace middleware not implemented")
  )
);
