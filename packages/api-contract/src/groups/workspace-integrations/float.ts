import { HttpApiEndpoint, HttpApiError, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";

export const FloatWorkspaceIntegrationGroup = HttpApiGroup.make(
  "FloatWorkspaceIntegration"
).add(
  HttpApiEndpoint.post("SetApiKey")`/set-api-key`
    .setPayload(
      Schema.Struct({
        apiKey: Schema.NonEmptyString,
      })
    )
    .addError(HttpApiError.InternalServerError)
);
