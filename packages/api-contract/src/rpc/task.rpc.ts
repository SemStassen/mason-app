import { Rpc, RpcGroup } from "@effect/rpc";
import { Schema } from "effect";
import { ProjectId, WorkspaceId } from "../../../core/types/src";
import {
  CreateTaskRequest,
  TaskResponse,
  UpdateTaskRequest,
} from "../dto/task.dto";
import { extendDTO } from "./utils";

export class TaskRpc extends RpcGroup.make(
  Rpc.make("Create", {
    // Direct usage ensures type safety with DTO
    payload: CreateTaskRequest,
    success: TaskResponse,
  }),

  Rpc.make("Update", {
    // Extend UpdateTaskRequest with context fields
    payload: extendDTO(UpdateTaskRequest, {
      workspaceId: WorkspaceId,
      projectId: ProjectId,
    }),
    success: TaskResponse,
  }),

  Rpc.make("List", {
    success: Schema.Array(TaskResponse),
  })
) {}
