import { Schema } from "effect";
import { Member } from "./member.model";

const MemberFields = Member.from.fields;

export const MemberCommands = {
  Create: Schema.Struct({
    userId: MemberFields.userId,
    workspaceId: MemberFields.workspaceId,
    role: MemberFields.role,
  }),
  Patch: Schema.Struct({
    role: Schema.optionalWith(MemberFields.role, { exact: true }),
  }),
};

export type CreateMemberCommand = typeof MemberCommands.Create.Type;
export type PatchMemberCommand = typeof MemberCommands.Patch.Type;
