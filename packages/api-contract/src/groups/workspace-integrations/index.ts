import { HttpApiEndpoint, HttpApiError, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";
import { WorkspaceIntegrationResponse } from "~/models/workspace-integration.model";

export const WorkspaceIntegrationsGroup = HttpApiGroup.make(
  "WorkspaceIntegrations"
).add(
  HttpApiEndpoint.post("ListIntegrations")`/`
    .addSuccess(Schema.Array(WorkspaceIntegrationResponse))
    .addError(HttpApiError.InternalServerError)
);
