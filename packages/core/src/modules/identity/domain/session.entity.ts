import { Model, Schema } from "~/shared/effect";
import { SessionId, UserId, WorkspaceId } from "~/shared/schemas";

export class Session extends Model.Class<Session>("Session")(
  {
    id: Model.ServerManaged(SessionId),
    userId: Model.ServerManaged(UserId),
    activeWorkspaceId: Model.ServerManaged(Schema.Option(WorkspaceId)),
  },
  {
    identifier: "Session",
    title: "Session",
    description: "A session",
  }
) {}
