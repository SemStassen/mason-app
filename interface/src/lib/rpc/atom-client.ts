import {
  AuthRpcGroup,
  UserRpcGroup,
  WorkspaceRpcGroup,
} from "@recount/core/rpc";
import { Layer } from "effect";
import {
  FetchHttpClient,
  HttpClient,
  HttpClientError,
} from "effect/unstable/http";
import { AtomRpc, Reactivity } from "effect/unstable/reactivity";
import { RpcClient, RpcSerialization } from "effect/unstable/rpc";

import { RpcSessionMiddlewareLayerClient } from "./middleware";

const allRpcGroups = AuthRpcGroup.merge(UserRpcGroup, WorkspaceRpcGroup);

const RpcProtocolHttpLayer = RpcClient.layerProtocolHttp({
  url: `${import.meta.env.VITE_BACKEND_URL}/rpc`,
  transformClient: (client) =>
    client.pipe(
      HttpClient.retry({
        times: 3,
        // Only retry server errors (5xx), not client errors (4xx) like 401/403
        while: (error) => {
          if (HttpClientError.isHttpClientError(error)) {
            const status = error.response?.status;
            return status === undefined || (status >= 500 && status < 600);
          }
          return false;
        },
      })
    ),
}).pipe(
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(
    Layer.succeed(FetchHttpClient.RequestInit, {
      credentials: "include",
    })
  ),
  Layer.provide(RpcSerialization.layerNdjson)
);

const AtomRpcProtocolLayer = Layer.mergeAll(
  RpcProtocolHttpLayer,
  RpcSessionMiddlewareLayerClient,
  Reactivity.layer
);

export class RecountAtomRpcClient extends AtomRpc.Service<RecountAtomRpcClient>()(
  "@recount/interface/RecountAtomRpcClient",
  {
    group: allRpcGroups,
    protocol: AtomRpcProtocolLayer,
  }
) {}
