import { Schema } from "effect";
import { Email } from "~/shared/schemas";

export const UserQueries = {
  RetrieveWithMemberByEmail: Schema.Struct({
    email: Email,
  }),
};

export type RetrieveWithMemberByEmailQuery =
  typeof UserQueries.RetrieveWithMemberByEmail.Type;
