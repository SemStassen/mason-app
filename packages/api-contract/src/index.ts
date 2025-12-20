import { AuthGroup } from "./groups/auth";
import { OAuthGroup } from "./groups/o-auth";
import { PingGroup } from "./groups/ping";
import { ProjectGroup } from "./groups/project";
import { TaskGroup } from "./groups/task";
import { WorkspaceGroup } from "./groups/workspace";
import { WorkspaceIntegrationGroup } from "./groups/workspace-integrations";
import { FloatWorkspaceIntegrationGroup } from "./groups/workspace-integrations/float";
import { AuthMiddleware } from "./middleware/auth";
import { SessionMiddleware } from "./middleware/session";
import { HttpApi} from "@effect/platform";

const PublicMasonApi = HttpApi.make("PublicMasonApi")
  .add(PingGroup.prefix("/ping"))
  .add(AuthGroup.prefix("/auth"))
  .add(OAuthGroup.prefix("/oauth"));

const PrivateMasonApi = HttpApi.make("PrivateMasonApi")
  .middleware(AuthMiddleware)
  .add(WorkspaceGroup.prefix("/workspace"))
   /**
   * All routes below this point requires workspace context
   */
  .middleware(SessionMiddleware)
  .add(
    ProjectGroup.prefix("/project")
  )
  .add(
    TaskGroup.prefix("/task")
  )
  // Integrations
  .add(
    WorkspaceIntegrationGroup.prefix("/integrations")
  )
  .add(
    FloatWorkspaceIntegrationGroup.prefix("/integrations/float")
  );


export const MasonApi = HttpApi.make("MasonApi")
  .addHttpApi(PublicMasonApi)
  .addHttpApi(PrivateMasonApi)
  .prefix("/api");
