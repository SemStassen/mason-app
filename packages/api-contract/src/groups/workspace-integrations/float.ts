import { HttpApiEndpoint, HttpApiError, HttpApiGroup } from "@effect/platform";

export const FloatWorkspaceIntegrationGroup = HttpApiGroup.make(
  "FloatWorkspaceIntegration",
).add(
  HttpApiEndpoint.get("Sync")`/sync`.addError(HttpApiError.InternalServerError),
);
