import { Schema } from "effect";
import { Email } from "~/shared/schemas";

export type UserId = typeof UserId.Type;
export const UserId = Schema.UUID.pipe(Schema.brand("UserId"));

export type UserDisplayName = typeof UserDisplayName.Type;
export const UserDisplayName = Schema.NonEmptyString.pipe(
  Schema.maxLength(100)
);

/**
 * User domain model.
 *
 * Represents a user.
 *
 * @category Models
 * @since 0.1.0
 */
export type User = typeof User.Type;
export const User = Schema.TaggedStruct("User", {
  id: UserId,
  displayName: UserDisplayName,
  email: Email,
  emailVerified: Schema.Boolean,
  imageUrl: Schema.OptionFromSelf(Schema.NonEmptyString),
}).pipe(
  Schema.Data,
  Schema.annotations({
    identifier: "User",
    title: "User",
    description: "A user",
  })
);
