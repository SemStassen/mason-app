import { AuthRpcGroup, WorkspaceRpcGroup } from "@mason/core/rpc";
import { Layer } from "effect";
import { FetchHttpClient } from "effect/unstable/http";
import { AtomRpc, Reactivity } from "effect/unstable/reactivity";
import { RpcClient, RpcSerialization } from "effect/unstable/rpc";

import { SessionMiddlewareLayerClient } from "./middleware";

const allRpcGroups = AuthRpcGroup.merge(WorkspaceRpcGroup);

const RpcProtocolHttpLayer = RpcClient.layerProtocolHttp({
  url: `${import.meta.env.VITE_BACKEND_URL}/rpc`,
}).pipe(
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(RpcSerialization.layerNdjson)
);

const AtomRpcProtocolLayer = Layer.mergeAll(
  RpcProtocolHttpLayer,
  SessionMiddlewareLayerClient,
  Reactivity.layer
);

export class MasonAtomRpcClient extends AtomRpc.Service<MasonAtomRpcClient>()(
  "@mason/interface/MasonAtomRpcClient",
  {
    group: allRpcGroups,
    protocol: AtomRpcProtocolLayer,
  }
) {}
