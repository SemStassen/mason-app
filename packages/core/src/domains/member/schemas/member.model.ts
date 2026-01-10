import { Schema } from "effect";
import { MemberId, UserId, WorkspaceId, WorkspaceRole } from "~/shared/schemas";

/**
 * Member domain model.
 *
 * Represents a member of a workspace.
 *
 * @category Models
 * @since 0.1.0
 */
export type Member = typeof Member.Type;
export const Member = Schema.TaggedStruct("Member", {
  id: MemberId,
  userId: UserId,
  workspaceId: WorkspaceId,
  role: WorkspaceRole,
  deletedAt: Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf),
}).pipe(
  Schema.Data,
  Schema.annotations({
    identifier: "Member",
    title: "Member",
    description: "A member of a workspace",
  })
);
