import { ServiceMap } from "effect";

import type { Session, User } from "#modules/identity/index";
import type { WorkspaceMember } from "#modules/workspace-member/index";
import type { Workspace } from "#modules/workspace/index";

export class SessionContext extends ServiceMap.Service<
  SessionContext,
  {
    session: Session;
    user: User;
  }
>()("@mason/shared/SessionContext") {}

export class WorkspaceContext extends ServiceMap.Service<
  WorkspaceContext,
  {
    member: WorkspaceMember;
    workspace: Workspace;
  }
>()("@mason/shared/WorkspaceContext") {}
