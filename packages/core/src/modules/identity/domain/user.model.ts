import { Effect, Schema } from "effect";
import { Email, Model, UserId } from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";

export class User extends Model.Class<User>("User")(
  {
    id: Model.DomainManaged(UserId),
    displayName: Model.Mutable(
      Schema.NonEmptyString.pipe(Schema.maxLength(100))
    ),
    email: Model.UserImmutable(Email),
    emailVerified: Model.DomainManaged(Schema.Boolean),
    imageUrl: Model.Mutable(Schema.OptionFromSelf(Schema.NonEmptyString)),
  },
  {
    identifier: "User",
    title: "User",
    description: "A user",
  }
) {
  private static _validate = (input: typeof User.model.Type) =>
    Schema.validate(User)(input);

  static fromInput = (input: typeof User.create.Type) =>
    Effect.gen(function* () {
      const safeInput = yield* Schema.decodeUnknown(User.create)(input);

      return yield* User._validate({
        id: UserId.make(generateUUID()),
        emailVerified: false,
        ...safeInput,
      });
    });

  patch = (patch: typeof User.patch.Type) =>
    Effect.gen(this, function* () {
      const safePatch = yield* Schema.decodeUnknown(User.patch)(patch);

      return yield* User._validate({ ...this, ...safePatch });
    });

  verifyEmail = () =>
    Effect.gen(this, function* () {
      return yield* User._validate({ ...this, emailVerified: true });
    });
}
