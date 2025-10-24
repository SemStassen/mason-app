import { HttpApiEndpoint, HttpApiError, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";
import {
  CreateWorkspaceIntegrationRequest,
  DeleteWorkspaceIntegrationRequest,
  UpdateWorkspaceIntegrationRequest,
  WorkspaceIntegrationResponse,
} from "../../dto/workspace-integration.dto";
import { idParam } from "../../utils";

export const WorkspaceIntegrationGroup = HttpApiGroup.make(
  "WorkspaceIntegration"
)
  .add(
    HttpApiEndpoint.post("Create")`/`
      .setPayload(CreateWorkspaceIntegrationRequest)
      .addError(HttpApiError.InternalServerError)
      .addSuccess(WorkspaceIntegrationResponse)
  )
  .add(
    HttpApiEndpoint.put("Update")`/${idParam}`
      .setPath(UpdateWorkspaceIntegrationRequest.pick("id"))
      .setPayload(UpdateWorkspaceIntegrationRequest.omit("id"))
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
