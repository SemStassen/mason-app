import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import {
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  WorkspaceResponse,
} from "../dto/workspace.dto";

export class WorkspaceRpc extends RpcGroup.make(
  Rpc.make("CheckSlugAvailability", {
    payload: Schema.Struct({
      slug: Schema.NonEmptyString,
    }),
    success: Schema.Struct({
      status: Schema.Boolean,
    }),
  }),

  Rpc.make("SetActive", {
    payload: Schema.Struct({
      workspaceId: Schema.optional(Schema.NonEmptyString),
      workspaceSlug: Schema.optional(Schema.NonEmptyString),
    }),
    success: Schema.Void,
  }),

  Rpc.make("Create", {
    payload: CreateWorkspaceRequest,
    success: WorkspaceResponse,
  }),

  Rpc.make("Update", {
    payload: Schema.Struct({
      workspaceId: Schema.NonEmptyString,
      ...UpdateWorkspaceRequest.fields,
    }),
    success: WorkspaceResponse,
  }),

  Rpc.make("Retrieve", {
    payload: Schema.Struct({
      workspaceId: Schema.optional(Schema.NonEmptyString),
      workspaceSlug: Schema.optional(Schema.NonEmptyString),
      membersLimit: Schema.optionalWith(Schema.Number, {
        default: () => 100,
      }),
    }),
    success: WorkspaceResponse,
  }),

  Rpc.make("List", {
    success: Schema.Array(WorkspaceResponse),
  })
) {}
