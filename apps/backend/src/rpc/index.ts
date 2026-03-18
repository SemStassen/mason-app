import { PingRpcGroup, WorkspaceRpcGroup } from "@mason/core/rpc";
import { Layer } from "effect";
import { PingRpcGroupLayer } from "./handlers/ping";
import { WorkspaceRpcGroupLayer } from "./handlers/workspace";

export const AllRpcsGroup = PingRpcGroup.merge(WorkspaceRpcGroup);

export const AllRpcsGroupLayer = Layer.mergeAll(
  PingRpcGroupLayer,
  WorkspaceRpcGroupLayer
);
