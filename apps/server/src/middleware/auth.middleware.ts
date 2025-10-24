import { HttpServerRequest } from "@effect/platform";
import {
  AuthMiddleware,
  RequestContextData,
} from "@mason/api-contract/middleware/auth";
import { MemberId, UserId, WorkspaceId } from "@mason/core/models/ids";
import { AuthService } from "@mason/core/services/auth.service";
import { Effect, Layer } from "effect";

// biome-ignore lint/performance/noBarrelFile: This is for cleanliness
export { RequestContext } from "@mason/api-contract/middleware/auth";

export const AuthMiddlewareLive = Layer.effect(
  AuthMiddleware,
  Effect.gen(function* () {
    const authService = yield* AuthService;
    return {
      bearer: (bearerToken) =>
        Effect.gen(function* () {
          const request = yield* HttpServerRequest.HttpServerRequest;

          const session = yield* authService
            .use((client) =>
              client.api.getSession({
                headers: new Headers(request.headers),
              })
            )
            .pipe(Effect.catchAll(() => Effect.succeed(null)));

          yield* Effect.log("Hitting auth middleware (not implemented)");

          return new RequestContextData({
            userId: UserId.make("0199196e-9662-7fcd-8a57-5080915b3851"),
            memberId: MemberId.make("01992928-9155-78f4-8141-942a0fbcd851"),
            workspaceId: WorkspaceId.make(
              "01992928-9148-7951-b4b4-f69448ce5912"
            ),
          });
        }),
    };
  })
);
