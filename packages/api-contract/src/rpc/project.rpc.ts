import { Rpc, RpcGroup } from "@effect/rpc";
import { WorkspaceId } from "@mason/types";
import { Schema } from "effect";
import {
  CreateProjectRequest,
  ProjectResponse,
  UpdateProjectRequest,
} from "../dto/project.dto";
import { extendDTO } from "./utils";

export class ProjectRpc extends RpcGroup.make(
  Rpc.make("Create", {
    // Type safety: CreateProjectRequest is checked against ProjectToCreateDTO in project.dto.ts
    payload: CreateProjectRequest,
    success: ProjectResponse,
  }),

  Rpc.make("Update", {
    // Extend UpdateProjectRequest with workspaceId from context
    // Type safety: UpdateProjectRequest is checked against ProjectToUpdateDTO in project.dto.ts
    payload: extendDTO(UpdateProjectRequest, {
      workspaceId: WorkspaceId,
    }),
    success: ProjectResponse,
  }),

  Rpc.make("List", {
    success: Schema.Array(ProjectResponse),
  })
) {}
