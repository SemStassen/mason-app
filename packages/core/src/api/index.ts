import { HttpApiBuilder } from "@effect/platform";
import type { Api } from "@effect/platform/HttpApi";
import { MasonApi } from "@mason/api-contract";
import { Layer } from "effect";
import type { AuthService } from "~/services/auth";
import type { DatabaseService } from "~/services/db";
import { AuthGroupLive } from "./handlers/auth";
import { OAuthGroupLive } from "./handlers/oauth";
import { PingGroupLive } from "./handlers/ping";
import { WorkspaceGroupLive } from "./handlers/workspace";
import { WorkspaceIntegrationsGroupLive } from "./handlers/workspace-integrations";
import { FloatWorkspaceIntegrationGroupLive } from "./handlers/workspace-integrations/float";

export const MasonApiLive: Layer.Layer<
  Api,
  never,
  AuthService | DatabaseService
> = HttpApiBuilder.api(MasonApi).pipe(
  Layer.provide(PingGroupLive),
  Layer.provide(AuthGroupLive),
  Layer.provide(OAuthGroupLive),
  Layer.provide(WorkspaceGroupLive),
  // Integrations
  Layer.provide(WorkspaceIntegrationsGroupLive),
  Layer.provide(FloatWorkspaceIntegrationGroupLive)
);
