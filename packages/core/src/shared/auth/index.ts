import { Context } from "effect";
import type { Session, User } from "~/modules/identity";
import type { Member } from "~/modules/member";
import type { Workspace } from "~/modules/workspace";

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
