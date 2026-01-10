import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import { InviteUserToWorkspaceCommand } from "~/use-cases/workspace/invite-user-to-workspace";

export const WorkspaceRpc = RpcGroup.make(
  Rpc.make("InviteUser", {
    payload: InviteUserToWorkspaceCommand,
    success: Schema.Void,
  })
);
