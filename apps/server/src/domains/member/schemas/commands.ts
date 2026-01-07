import { Schema } from "effect";
import { Member } from "./member.model";

const MemberFields = Member.from.fields;

export const MemberCommands = {
  Create: Schema.Struct({
    userId: MemberFields.userId,
    role: MemberFields.role,
  }),
  Update: Schema.Struct({
    id: MemberFields.id,
    role: Schema.optionalWith(MemberFields.role, { exact: true }),
  }),
};

export type CreateMemberCommand = typeof MemberCommands.Create.Type;
export type UpdateMemberCommand = typeof MemberCommands.Update.Type;
