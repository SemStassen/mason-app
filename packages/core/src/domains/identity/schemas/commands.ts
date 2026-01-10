import { Schema } from "effect";
import { User } from "./user.model";

const UserFields = User.from.fields;

export const UserCommands = {
  Create: Schema.Struct({
    displayName: UserFields.displayName,
    email: UserFields.email,
    imageUrl: Schema.optionalWith(UserFields.imageUrl, { exact: true }),
  }),
  Patch: Schema.Struct({
    displayName: Schema.optionalWith(UserFields.displayName, { exact: true }),
    imageUrl: Schema.optionalWith(UserFields.imageUrl, { exact: true }),
  }),
  UpdateEmail: UserFields.email,
};

export type CreateUserCommand = typeof UserCommands.Create.Type;
export type PatchUserCommand = typeof UserCommands.Patch.Type;
export type UpdateUserEmailCommand = typeof UserCommands.UpdateEmail.Type;
