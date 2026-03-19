import {
  type Action,
  isAllowed,
  type WorkspaceRole,
} from "@mason/core/shared/authorization";
import { Effect, Layer, Schema, ServiceMap } from "effect";

export class AuthorizationError extends Schema.TaggedErrorClass<AuthorizationError>()(
  "authorization/AuthorizationError",
  {}
) {}

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
    Effect.gen(function* () {
      return {
        ensureAllowed: (params) =>
          Effect.gen(function* () {
            if (!isAllowed(params)) {
              return yield* new AuthorizationError();
            }
          }),
      };
    })
  );
}
