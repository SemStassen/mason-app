import { HttpApiBuilder } from "@effect/platform";
import { MasonApi } from "@mason/api-contract";
import { Layer } from "effect";
import { AuthGroupLive } from "./handlers/auth";
import { OAuthGroupLive } from "./handlers/o-auth";
import { PingGroupLive } from "./handlers/ping";
import { ProjectGroupLive } from "./handlers/project";
import { TaskGroupLive } from "./handlers/tasks";
import { WorkspaceGroupLive } from "./handlers/workspace";
import { WorkspaceIntegrationsGroupLive } from "./handlers/workspace-integrations";
import { FloatWorkspaceIntegrationGroupLive } from "./handlers/workspace-integrations/float";

export const MasonApiLive = HttpApiBuilder.api(MasonApi).pipe(
  Layer.provide(PingGroupLive),
  Layer.provide(AuthGroupLive),
  Layer.provide(OAuthGroupLive),
  Layer.provide(WorkspaceGroupLive),
  Layer.provide(ProjectGroupLive),
  Layer.provide(TaskGroupLive),
  // Integrations
  Layer.provide(WorkspaceIntegrationsGroupLive),
  Layer.provide(FloatWorkspaceIntegrationGroupLive)
);
