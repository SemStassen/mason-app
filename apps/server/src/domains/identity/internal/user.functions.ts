import { type Effect, Option, type ParseResult, Schema } from "effect";
import { dual } from "effect/Function";
import { UserId } from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";
import { User } from "../schemas/user.model";

// =============================================================================
// Constructors
// =============================================================================

/** Internal: validates and constructs a User via Schema. */
const _make = (input: User): Effect.Effect<User, ParseResult.ParseError> =>
  Schema.validate(User)(input);

/** Default values for new users. */
const defaults = {
  emailVerified: false,
  imageUrl: Option.none(),
} as const;

/**
 * Create a new user with generated ID.
 *
 * @category Constructors
 * @since 0.1.0
 */
const createUser = (input: {
  displayName: User["displayName"];
  email: User["email"];
  emailVerified?: User["emailVerified"];
  imageUrl?: User["imageUrl"];
}): Effect.Effect<User, ParseResult.ParseError> =>
  _make({
    ...defaults,
    ...input,
    id: UserId.make(generateUUID()),
    _tag: "User",
  });

// =============================================================================
// Transformations
// =============================================================================

interface PatchUser {
  displayName?: User["displayName"];
  imageUrl?: User["imageUrl"];
}

/**
 * Update a user with patch data.
 *
 * @category Transformations
 * @since 0.1.0
 */
const updateUser = dual<
  (
    patch: PatchUser
  ) => (self: User) => Effect.Effect<User, ParseResult.ParseError>,
  (self: User, patch: PatchUser) => Effect.Effect<User, ParseResult.ParseError>
>(2, (self, patch) =>
  _make({
    ...self,
    ...patch,
    id: self.id,
  })
);

/**
 * Update a user's email.
 * This will mark the user's email as unverified.
 *
 * @category Transformations
 * @since 0.1.0
 */
const updateEmail = dual<
  (
    email: User["email"]
  ) => (self: User) => Effect.Effect<User, ParseResult.ParseError>,
  (
    self: User,
    email: User["email"]
  ) => Effect.Effect<User, ParseResult.ParseError>
>(2, (self, email) =>
  _make({
    ...self,
    email,
    emailVerified: false,
    id: self.id,
  })
);

/**
 * Mark a user's email as verified.
 *
 * @category Transformations
 * @since 0.1.0
 */
const markEmailAsVerified = (self: User) =>
  _make({
    ...self,
    emailVerified: true,
    id: self.id,
  });

export const UserFns = {
  create: createUser,
  update: updateUser,
  updateEmail: updateEmail,
  markEmailAsVerified: markEmailAsVerified,
} as const;
