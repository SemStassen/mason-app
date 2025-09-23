import { HttpApiEndpoint, HttpApiError, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";
import { WorkspaceIntegrationResponse } from "../..//dto/workspace-integration.dto";

export const WorkspaceIntegrationsGroup = HttpApiGroup.make(
  "WorkspaceIntegrations"
)
  .add(
    HttpApiEndpoint.post("SetApiKey")`/create`
      .setPayload(
        Schema.Struct({
          kind: Schema.Literal("float"),
          apiKey: Schema.NonEmptyString,
        })
      )
      .addError(HttpApiError.InternalServerError)
  )
  .add(
    HttpApiEndpoint.get("ListIntegrations")`/`
      .addSuccess(Schema.Array(WorkspaceIntegrationResponse))
      .addError(HttpApiError.InternalServerError)
  );
