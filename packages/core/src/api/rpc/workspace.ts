import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import {
  CheckWorkspaceSlugIsUniqueRequest,
  CheckWorkspaceSlugIsUniqueResponse,
  CreateWorkspaceRequest,
  PatchWorkspaceRequest,
  SetActiveWorkspaceRequest,
} from "~/flows";

export const WorkspaceRpcs = RpcGroup.make(
  Rpc.make("Workspace.Create", {
    payload: CreateWorkspaceRequest,
    success: Schema.Void,
  }),
  Rpc.make("Workspace.CheckSlugIsUnique", {
    payload: CheckWorkspaceSlugIsUniqueRequest,
    success: CheckWorkspaceSlugIsUniqueResponse,
  }),
  Rpc.make("Workspace.Patch", {
    payload: PatchWorkspaceRequest,
    success: Schema.Void,
  }),
  Rpc.make("Workspace.SetActive", {
    payload: SetActiveWorkspaceRequest,
    success: Schema.Void,
  })
);
