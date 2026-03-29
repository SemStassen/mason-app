import { ServiceMap } from "effect";

import type { Session, User } from "#modules/identity/index";
import type { WorkspaceMember } from "#modules/workspace-member/index";
import type { Workspace } from "#modules/workspace/index";

export interface SessionContextShape {
  session: Session;
  user: User;
}

export class SessionContext extends ServiceMap.Service<
  SessionContext,
  SessionContextShape
>()("@mason/shared/SessionContext") {}

export interface WorkspaceContextShape {
  workspaceMember: WorkspaceMember;
  workspace: Workspace;
}

export class WorkspaceContext extends ServiceMap.Service<
  WorkspaceContext,
  WorkspaceContextShape
>()("@mason/shared/WorkspaceContext") {}
