import { AuthRpcGroup, WorkspaceRpcGroup } from "@mason/core/rpc";
import { Layer } from "effect";

import { AuthRpcGroupLayer } from "./handlers/auth";
import { WorkspaceRpcGroupLayer } from "./handlers/workspace";

export const AllRpcsGroup = AuthRpcGroup.merge(WorkspaceRpcGroup);

export const AllRpcsGroupLayer = Layer.mergeAll(
  AuthRpcGroupLayer,
  WorkspaceRpcGroupLayer
);
