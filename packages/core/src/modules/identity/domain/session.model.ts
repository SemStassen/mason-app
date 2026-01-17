import { Schema } from "effect";
import { SessionId, UserId, WorkspaceId } from "~/shared/schemas";
import type { SchemaFields } from "~/shared/utils";

export type SessionActiveWorkspaceId = typeof SessionActiveWorkspaceId.Type;
export const SessionActiveWorkspaceId = Schema.OptionFromSelf(WorkspaceId);

export class Session extends Schema.TaggedClass<Session>("Session")(
  "Session",
  {
    id: SessionId,
    userId: UserId,
    activeWorkspaceId: SessionActiveWorkspaceId,
  },
  {
    identifier: "Session",
    title: "Session",
    description: "A session",
  }
) {
  private static _validate = (input: SchemaFields<typeof Session>) =>
    Schema.decodeUnknown(Session)(input);

  setActiveWorkspace = (activeWorkspaceId: Session["activeWorkspaceId"]) => {
    return Session._validate({
      ...this,
      activeWorkspaceId,
    });
  };
}
