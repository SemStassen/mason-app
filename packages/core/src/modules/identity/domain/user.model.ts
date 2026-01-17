import { Effect, Option, Schema } from "effect";
import { Email, UserId } from "~/shared/schemas";
import { generateUUID, type SchemaFields } from "~/shared/utils";

export class User extends Schema.TaggedClass<User>("User")(
  "User",
  {
    id: UserId,
    displayName: Schema.NonEmptyString.pipe(Schema.maxLength(100)),
    email: Email,
    emailVerified: Schema.Boolean,
    imageUrl: Schema.OptionFromSelf(Schema.NonEmptyString),
  },
  {
    identifier: "User",
    title: "User",
    description: "A user",
  }
) {
  private static _validate = (input: SchemaFields<typeof User>) =>
    Schema.decodeUnknown(User)(input);

  private static _defaults = {
    emailVerified: false,
    imageUrl: Option.none(),
  };

  static create = (input: CreateUser) =>
    Effect.gen(function* () {
      const safeInput = yield* Schema.decodeUnknown(CreateUser)(input);

      return yield* User._validate({
        ...User._defaults,
        ...safeInput,
        id: UserId.make(generateUUID()),
        _tag: "User",
      });
    });

  patch = (input: PatchUser) =>
    Effect.gen(this, function* () {
      const safeInput = yield* Schema.decodeUnknown(PatchUser)(input);

      return yield* User._validate({
        ...this,
        ...safeInput,
      });
    });
}

export type CreateUser = typeof CreateUser.Type;
export const CreateUser = Schema.Struct({
  displayName: User.fields.displayName,
  email: User.fields.email,
  imageUrl: Schema.optionalWith(User.fields.imageUrl, { exact: true }),
});

export type PatchUser = typeof PatchUser.Type;
export const PatchUser = Schema.Struct({
  displayName: Schema.optionalWith(User.fields.displayName, { exact: true }),
  imageUrl: Schema.optionalWith(User.fields.imageUrl, { exact: true }),
});
