import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";

export class FloatWorkspaceIntegrationRpc extends RpcGroup.make(
  Rpc.make("Sync", {
    success: Schema.Void,
  })
) {}
