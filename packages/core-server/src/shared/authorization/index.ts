import {
  AuthorizationError,
  isAllowed,
} from "@mason/core/shared/authorization";
import type { Action, WorkspaceRole } from "@mason/core/shared/authorization";
import { Effect, Layer, ServiceMap } from "effect";

export class Authorization extends ServiceMap.Service<
  Authorization,
  {
    ensureAllowed: (params: {
      action: Action;
      role: WorkspaceRole;
    }) => Effect.Effect<void, AuthorizationError>;
  }
>()("@mason/authorization/Authorization") {
  static readonly layer = Layer.effect(
    Authorization,
    Effect.succeed({
      ensureAllowed: (params) =>
        Effect.gen(function* () {
          if (!isAllowed(params)) {
            return yield* new AuthorizationError();
          }
        }),
    })
  );
}
