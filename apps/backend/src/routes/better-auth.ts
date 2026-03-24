import { BetterAuth } from "@mason/auth";
import { Effect } from "effect";
import {
  HttpRouter,
  HttpServerRequest,
  HttpServerResponse,
} from "effect/unstable/http";

export const BetterAuthRoutesLayer = HttpRouter.add(
  "*",
  "/api/auth/*",
  (request) =>
    Effect.gen(function* () {
      const betterAuth = yield* BetterAuth;

      const webRequest = yield* HttpServerRequest.toWeb(request);
      const webResponse = yield* betterAuth.use((client) =>
        client.handler(webRequest)
      );

      return HttpServerResponse.fromWeb(webResponse);
    })
);
