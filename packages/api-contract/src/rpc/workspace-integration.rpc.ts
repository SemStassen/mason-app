import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import {
  CreateWorkspaceIntegrationRequest,
  DeleteWorkspaceIntegrationRequest,
  WorkspaceIntegrationResponse,
} from "../dto/workspace-integration.dto";

export class WorkspaceIntegrationRpc extends RpcGroup.make(
  Rpc.make("Create", {
    payload: CreateWorkspaceIntegrationRequest,
    success: WorkspaceIntegrationResponse,
  }),

  Rpc.make("Delete", {
    payload: DeleteWorkspaceIntegrationRequest,
    success: Schema.Void,
  }),

  Rpc.make("List", {
    success: Schema.mutable(Schema.Array(WorkspaceIntegrationResponse)),
  })
) {}
