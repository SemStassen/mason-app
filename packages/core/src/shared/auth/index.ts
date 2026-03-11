import { ServiceMap } from "effect";
import type { Session } from "~/modules/identity/domain/session.entity";
import type { User } from "~/modules/identity/domain/user.entity";
import type { Workspace } from "~/modules/workspace/domain/workspace.entity";
import type { WorkspaceMember } from "~/modules/workspace-member/domain/workspace-member.entity";

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
