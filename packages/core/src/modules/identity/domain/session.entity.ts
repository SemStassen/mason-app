import { Model } from "#internal/effect/index";
import { SessionId, UserId, WorkspaceId } from "#shared/schemas/index";

export class Session extends Model.Class<Session>("Session")(
  {
    id: Model.ServerImmutable(SessionId),
    userId: Model.ServerImmutable(UserId),
    activeWorkspaceId: Model.ServerMutableOptional(WorkspaceId),
  },
  {
    identifier: "Session",
    title: "Session",
    description: "A session",
  }
) {}
