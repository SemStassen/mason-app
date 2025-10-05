import { HttpApiEndpoint, HttpApiError, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";
import {
  DeleteWorkspaceIntegrationRequest,
  UpsertWorkspaceIntegrationRequest,
  WorkspaceIntegrationResponse,
} from "../../dto/workspace-integration.dto";
import { idParam } from "../../utils";

export const WorkspaceIntegrationsGroup = HttpApiGroup.make(
  "WorkspaceIntegrations"
)
  .add(
    HttpApiEndpoint.put("Upsert")`/`
      .setPayload(UpsertWorkspaceIntegrationRequest)
      .addError(HttpApiError.InternalServerError)
      .addSuccess(WorkspaceIntegrationResponse)
  )
  .add(
    HttpApiEndpoint.del("Delete")`/${idParam}`
      .setPath(DeleteWorkspaceIntegrationRequest)
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.get("List")`/`
      .addSuccess(Schema.mutable(Schema.Array(WorkspaceIntegrationResponse)))
      .addError(HttpApiError.InternalServerError)
  );
