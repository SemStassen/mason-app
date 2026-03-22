import { SessionMiddleware } from "@mason/core/rpc";
import { Effect } from "effect";
import { Headers } from "effect/unstable/http";
import { RpcMiddleware } from "effect/unstable/rpc";

export const SessionMiddlewareLayerClient = RpcMiddleware.layerClient(
  SessionMiddleware,
  ({ request, next }) =>
    Effect.gen(function* () {
      const token = localStorage.getItem("access_token");

      if (token) {
        const newHeaders = Headers.set(
          request.headers,
          "authorization",
          `Bearer ${token}`
        );
        return yield* next({ ...request, headers: newHeaders });
      }

      return yield* next(request);
    })
);
