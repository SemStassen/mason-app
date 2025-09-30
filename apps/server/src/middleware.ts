import {
  AuthMiddleware,
  RequestContextData,
} from "@mason/api-contract/middleware/auth";
import { UserId, WorkspaceId } from "@mason/core/models/ids";
import { Effect, Layer, Redacted } from "effect";

// biome-ignore lint/performance/noBarrelFile: This is for cleanliness
export { RequestContext } from "@mason/api-contract/middleware/auth";

export const AuthMiddlewareLive = Layer.effect(
  AuthMiddleware,
  Effect.gen(function* () {
    return {
      bearer: (bearerToken) =>
        Effect.gen(function* () {
          yield* Effect.log(
            "checking bearer token",
            Redacted.value(bearerToken)
          );

          return new RequestContextData({
            userId: UserId.make("0199196e-9662-7fcd-8a57-5080915b3851"),
            workspaceId: WorkspaceId.make(
              "01992928-9148-7951-b4b4-f69448ce5912"
            ),
          });
        }),
    };
  })
);
