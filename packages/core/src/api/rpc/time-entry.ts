import { AuthorizationError } from "@mason/authorization";
import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";
import {
	CreateTimeEntryRequest,
	CreateTimeEntryResponse,
	DeleteTimeEntryRequest,
	DeleteTimeEntryResponse,
	UpdateTimeEntryRequest,
	UpdateTimeEntryResponse,
} from "~/flows/time-entry";
import {
	TimeEntryAlreadyRunningError,
	TimeEntryNotFoundError,
	TimeEntryStoppedAtBeforeStartedAtError,
} from "~/modules/time";
import { SessionMiddleware, WorkspaceMiddleware } from "./middleware";

export const TimeEntryRpcs = RpcGroup.make(
	Rpc.make("TimeEntry.Create", {
		payload: CreateTimeEntryRequest,
		success: CreateTimeEntryResponse,
		error: Schema.Union([
			AuthorizationError,
			TimeEntryStoppedAtBeforeStartedAtError,
			TimeEntryAlreadyRunningError,
			HttpApiError.InternalServerError,
		]),
	})
		.middleware(SessionMiddleware)
		.middleware(WorkspaceMiddleware),

	Rpc.make("TimeEntry.Update", {
		payload: UpdateTimeEntryRequest,
		success: UpdateTimeEntryResponse,
		error: Schema.Union([
			AuthorizationError,
			TimeEntryNotFoundError,
			TimeEntryStoppedAtBeforeStartedAtError,
			TimeEntryAlreadyRunningError,
			HttpApiError.InternalServerError,
		]),
	})
		.middleware(SessionMiddleware)
		.middleware(WorkspaceMiddleware),

	Rpc.make("TimeEntry.Delete", {
		payload: DeleteTimeEntryRequest,
		success: DeleteTimeEntryResponse,
		error: Schema.Union([
			AuthorizationError,
			TimeEntryNotFoundError,
			HttpApiError.InternalServerError,
		]),
	})
		.middleware(SessionMiddleware)
		.middleware(WorkspaceMiddleware),
);
