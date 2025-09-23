import { HttpApiBuilder } from "@effect/platform";
import { MasonApi } from "@mason/api-contract";

export const FloatWorkspaceIntegrationGroupLive = HttpApiBuilder.group(
  MasonApi,
  "FloatWorkspaceIntegration",
  (handlers) => handlers
);
