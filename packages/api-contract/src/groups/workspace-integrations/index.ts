import { HttpApiEndpoint, HttpApiError, HttpApiGroup } from "@effect/platform";
import { WorkspaceIntegrationResponse } from "@mason/core/models/workspace-integration.model";
import { Schema } from "effect";

export const WorkspaceIntegrationsGroup = HttpApiGroup.make(
  "WorkspaceIntegrations"
).add(
  HttpApiEndpoint.post("ListIntegrations")`/`
    .addSuccess(Schema.Array(WorkspaceIntegrationResponse))
    .addError(HttpApiError.InternalServerError)
);
