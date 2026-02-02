import { Context } from "effect";
import type { Session } from "~/modules/identity/domain/session.model";
import type { User } from "~/modules/identity/domain/user.model";
import type { Member } from "~/modules/member/domain/member.model";
import type { Workspace } from "~/modules/workspace/domain/workspace.model";

export class SessionContext extends Context.Tag("@mason/shared/SessionContext")<
  SessionContext,
  {
    session: Session;
    user: User;
  }
>() {}

export class WorkspaceContext extends Context.Tag(
  "@mason/shared/WorkspaceContext"
)<
  WorkspaceContext,
  {
    member: Member;
    workspace: Workspace;
  }
>() {}
