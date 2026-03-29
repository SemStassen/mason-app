import { AuthRpcGroup, UserRpcGroup, WorkspaceRpcGroup } from "@mason/core/rpc";
import { Layer } from "effect";

import { AuthRpcGroupLayer } from "./handlers/auth";
import { UserRpcGroupLayer } from "./handlers/user";
import { WorkspaceRpcGroupLayer } from "./handlers/workspace";

export const AllRpcsGroup = AuthRpcGroup.merge(UserRpcGroup, WorkspaceRpcGroup);

export const AllRpcsGroupLayer = Layer.mergeAll(
  AuthRpcGroupLayer,
  UserRpcGroupLayer,
  WorkspaceRpcGroupLayer
);
