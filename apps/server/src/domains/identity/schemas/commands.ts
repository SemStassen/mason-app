import { Schema } from "effect";
import { User } from "./user.model";

const UserFields = User.from.fields;

export const UserCommands = {
  Create: Schema.Struct({
    displayName: UserFields.displayName,
    email: UserFields.email,
    imageUrl: Schema.optionalWith(UserFields.imageUrl, { exact: true }),
  }),
  Update: Schema.Struct({
    id: UserFields.id,
    displayName: Schema.optionalWith(UserFields.displayName, { exact: true }),
    imageUrl: Schema.optionalWith(UserFields.imageUrl, { exact: true }),
  }),
  UpdateEmail: Schema.Struct({
    id: UserFields.id,
    email: UserFields.email,
  }),
  MarkEmailAsVerified: Schema.Struct({
    id: UserFields.id,
  }),
};

export type CreateUserCommand = typeof UserCommands.Create.Type;
export type UpdateUserCommand = typeof UserCommands.Update.Type;
export type UpdateUserEmailCommand = typeof UserCommands.UpdateEmail.Type;
export type MarkUserEmailAsVerifiedCommand =
  typeof UserCommands.MarkEmailAsVerified.Type;
