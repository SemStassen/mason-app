import { Schema } from "effect";
import { Member } from "./member.model";

const MemberFields = Member.from.fields;

export const MemberCommands = {
  AddUserToWorkspace: Schema.Struct({
    userId: MemberFields.userId,
    workspaceId: MemberFields.workspaceId,
    role: MemberFields.role,
  }),
  Update: Schema.Struct({
    memberId: MemberFields.id,
    role: Schema.optionalWith(MemberFields.role, { exact: true }),
  }),
};

export type AddUserToWorkspaceCommand =
  typeof MemberCommands.AddUserToWorkspace.Type;
export type UpdateMemberCommand = typeof MemberCommands.Update.Type;
