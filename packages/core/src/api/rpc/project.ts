import { AuthorizationError } from "@mason/authorization";
import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";
import {
	ArchiveProjectRequest,
	ArchiveProjectResponse,
	CreateProjectRequest,
	CreateProjectResponse,
	RestoreProjectRequest,
	RestoreProjectResponse,
	UpdateProjectRequest,
	UpdateProjectResponse,
} from "~/flows";
import {
	ProjectArchivedError,
	ProjectEndDateBeforeStartDateError,
	ProjectNotFoundError,
} from "~/modules/project";
import { SessionMiddleware, WorkspaceMiddleware } from "./middleware";

export const ProjectRpcs = RpcGroup.make(
	Rpc.make("Project.Create", {
		payload: CreateProjectRequest,
		success: CreateProjectResponse,
		error: Schema.Union([
			AuthorizationError,
			ProjectEndDateBeforeStartDateError,
			HttpApiError.InternalServerError,
		]),
	})
		.middleware(SessionMiddleware)
		.middleware(WorkspaceMiddleware),

	Rpc.make("Project.Update", {
		payload: UpdateProjectRequest,
		success: UpdateProjectResponse,
		error: Schema.Union([
			AuthorizationError,
			ProjectNotFoundError,
			ProjectArchivedError,
			ProjectEndDateBeforeStartDateError,
			HttpApiError.InternalServerError,
		]),
	})
		.middleware(SessionMiddleware)
		.middleware(WorkspaceMiddleware),

	Rpc.make("Project.Archive", {
		payload: ArchiveProjectRequest,
		success: ArchiveProjectResponse,
		error: Schema.Union([
			AuthorizationError,
			ProjectNotFoundError,
			HttpApiError.InternalServerError,
		]),
	})
		.middleware(SessionMiddleware)
		.middleware(WorkspaceMiddleware),

	Rpc.make("Project.Restore", {
		payload: RestoreProjectRequest,
		success: RestoreProjectResponse,
		error: Schema.Union([
			AuthorizationError,
			ProjectNotFoundError,
			HttpApiError.InternalServerError,
		]),
	})
		.middleware(SessionMiddleware)
		.middleware(WorkspaceMiddleware),
);
