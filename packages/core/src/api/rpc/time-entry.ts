import { AuthorizationError } from "@mason/authorization";
import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";
import {
  TimeEntryAlreadyRunningError,
  TimeEntryNotFoundError,
  TimeEntryStoppedAtBeforeStartedAtError,
} from "#modules/time/index";
import {
  CreateTimeEntryCommand,
  CreateTimeEntryResult,
  DeleteTimeEntryCommand,
  DeleteTimeEntryResult,
  UpdateTimeEntryCommand,
  UpdateTimeEntryResult,
} from "../contracts";
import { SessionMiddleware, WorkspaceMiddleware } from "./middleware";

export const TimeEntryRpcGroup = RpcGroup.make(
  Rpc.make("TimeEntry.Create", {
    payload: CreateTimeEntryCommand,
    success: CreateTimeEntryResult,
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
    payload: UpdateTimeEntryCommand,
    success: UpdateTimeEntryResult,
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
    payload: DeleteTimeEntryCommand,
    success: DeleteTimeEntryResult,
    error: Schema.Union([
      AuthorizationError,
      TimeEntryNotFoundError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(SessionMiddleware)
    .middleware(WorkspaceMiddleware)
);
