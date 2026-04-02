import { RpcSessionMiddleware } from "@recount/core/rpc";
import { Effect } from "effect";
import { Headers } from "effect/unstable/http";
import { RpcMiddleware } from "effect/unstable/rpc";

export const RpcSessionMiddlewareLayerClient = RpcMiddleware.layerClient(
  RpcSessionMiddleware,
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

      yield* Effect.logWarning(
        "RpcSessionMiddlewareLayerClient: no access_token found, request will be unauthenticated"
      );

      return yield* next(request);
    })
);
