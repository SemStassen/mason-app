import { AuthorizationError } from "@mason/authorization";
import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";
import {
	ArchiveTaskRequest,
	ArchiveTaskResponse,
	CreateTaskRequest,
	CreateTaskResponse,
	RestoreTaskRequest,
	RestoreTaskResponse,
	UpdateTaskRequest,
	UpdateTaskResponse,
} from "#flows/task/index";
import {
	ProjectArchivedError,
	ProjectNotFoundError,
	TaskNotFoundError,
} from "#modules/project/index";
import { SessionMiddleware, WorkspaceMiddleware } from "./middleware";

export const TaskRpcs = RpcGroup.make(
	Rpc.make("Task.Create", {
		payload: CreateTaskRequest,
		success: CreateTaskResponse,
		error: Schema.Union([
			AuthorizationError,
			ProjectNotFoundError,
			ProjectArchivedError,
			HttpApiError.InternalServerError,
		]),
	})
		.middleware(SessionMiddleware)
		.middleware(WorkspaceMiddleware),

	Rpc.make("Task.Update", {
		payload: UpdateTaskRequest,
		success: UpdateTaskResponse,
		error: Schema.Union([
			AuthorizationError,
			TaskNotFoundError,
			ProjectNotFoundError,
			ProjectArchivedError,
			HttpApiError.InternalServerError,
		]),
	})
		.middleware(SessionMiddleware)
		.middleware(WorkspaceMiddleware),

	Rpc.make("Task.Archive", {
		payload: ArchiveTaskRequest,
		success: ArchiveTaskResponse,
		error: Schema.Union([
			AuthorizationError,
			TaskNotFoundError,
			ProjectNotFoundError,
			ProjectArchivedError,
			HttpApiError.InternalServerError,
		]),
	})
		.middleware(SessionMiddleware)
		.middleware(WorkspaceMiddleware),

	Rpc.make("Task.Restore", {
		payload: RestoreTaskRequest,
		success: RestoreTaskResponse,
		error: Schema.Union([
			AuthorizationError,
			TaskNotFoundError,
			ProjectNotFoundError,
			ProjectArchivedError,
			HttpApiError.InternalServerError,
		]),
	})
		.middleware(SessionMiddleware)
		.middleware(WorkspaceMiddleware),
);
