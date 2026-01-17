import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import {
  AcceptWorkspaceInvitationRequest,
  CancelWorkspaceInvitationRequest,
  CreateWorkspaceInvitationRequest,
  RejectWorkspaceInvitationRequest,
} from "~/flows";

export const WorkspaceInvitationRpcs = RpcGroup.make(
  Rpc.make("WorkspaceInvitation.Create", {
    payload: CreateWorkspaceInvitationRequest,
    success: Schema.Void,
  }),
  Rpc.make("WorkspaceInvitation.Cancel", {
    payload: CancelWorkspaceInvitationRequest,
    success: Schema.Void,
  }),
  Rpc.make("WorkspaceInvitation.Accept", {
    payload: AcceptWorkspaceInvitationRequest,
    success: Schema.Void,
  }),
  Rpc.make("WorkspaceInvitation.Reject", {
    payload: RejectWorkspaceInvitationRequest,
    success: Schema.Void,
  })
);
