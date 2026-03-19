import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

import {
  CreateWorkspaceIntegrationCommand,
  CreateWorkspaceIntegrationResult,
} from "#api/contracts/index";
import { WorkspaceIntegrationProviderAlreadyExistsError } from "#modules/integration/index";
import { AuthorizationError } from "#shared/authorization/index";

import { SessionMiddleware, WorkspaceMiddleware } from "./middleware";

export const WorkspaceIntegrationRpcGroup = RpcGroup.make(
  Rpc.make("WorkspaceIntegration.Create", {
    payload: CreateWorkspaceIntegrationCommand,
    success: CreateWorkspaceIntegrationResult,
    error: Schema.Union([
      AuthorizationError,
      WorkspaceIntegrationProviderAlreadyExistsError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(SessionMiddleware)
    .middleware(WorkspaceMiddleware)
);
