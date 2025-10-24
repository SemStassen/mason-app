import { HttpApi } from "@effect/platform";
import { AuthGroup } from "./groups/auth";
import { OAuthGroup } from "./groups/o-auth";
import { PingGroup } from "./groups/ping";
import { ProjectGroup } from "./groups/project";
import { TaskGroup } from "./groups/tasks";
import { WorkspaceGroup } from "./groups/workspace";
import { WorkspaceIntegrationGroup } from "./groups/workspace-integrations";
import { FloatWorkspaceIntegrationGroup } from "./groups/workspace-integrations/float";
import { AuthMiddleware } from "./middleware/auth";

export const MasonApi = HttpApi.make("MasonApi")
  .add(PingGroup.prefix("/ping"))
  .add(AuthGroup.prefix("/auth"))
  .add(OAuthGroup.prefix("/oauth"))
  /**
   * All routes below this point require authentication
   */
  .add(WorkspaceGroup.prefix("/workspace").middleware(AuthMiddleware))
  .add(ProjectGroup.prefix("/project").middleware(AuthMiddleware))
  .add(TaskGroup.prefix("/task").middleware(AuthMiddleware))
  // Integrations
  .add(
    WorkspaceIntegrationGroup.prefix("/integrations").middleware(AuthMiddleware)
  )
  .add(
    FloatWorkspaceIntegrationGroup.prefix("/integrations/float").middleware(
      AuthMiddleware
    )
  )
  .prefix("/api");
