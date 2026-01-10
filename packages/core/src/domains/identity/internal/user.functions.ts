import { Effect, Option, Schema } from "effect";
import { dual } from "effect/Function";
import { UserId } from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";
import type {
  CreateUserCommand,
  PatchUserCommand,
  UpdateUserEmailCommand,
} from "../schemas";
import { User } from "../schemas/user.model";
import { IdentityDomainError } from "./errors";

// =============================================================================
// Constructors
// =============================================================================

/** Internal: validates and constructs a User via Schema. */
const _validate = (input: User): Effect.Effect<User, IdentityDomainError> =>
  Schema.validate(User)(input).pipe(
    Effect.catchTags({
      ParseError: (e) => Effect.fail(new IdentityDomainError({ cause: e })),
    })
  );

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
const createUser = (
  input: CreateUserCommand
): Effect.Effect<User, IdentityDomainError> =>
  _validate({
    ...defaults,
    ...input,
    id: UserId.make(generateUUID()),
    _tag: "User",
  });

// =============================================================================
// Transformations
// =============================================================================

/**
 * Patch a user with patch data.
 *
 * @category Transformations
 * @since 0.1.0
 */
const patchUser = dual<
  (
    patch: PatchUserCommand
  ) => (self: User) => Effect.Effect<User, IdentityDomainError>,
  (
    self: User,
    patch: PatchUserCommand
  ) => Effect.Effect<User, IdentityDomainError>
>(2, (self, patch) =>
  _validate({
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
    email: UpdateUserEmailCommand
  ) => (self: User) => Effect.Effect<User, IdentityDomainError>,
  (self: User, email: User["email"]) => Effect.Effect<User, IdentityDomainError>
>(2, (self, email) =>
  _validate({
    ...self,
    email,
    emailVerified: false,
  })
);

/**
 * Mark a user's email as verified.
 *
 * @category Transformations
 * @since 0.1.0
 */
const markEmailAsVerified = (self: User) =>
  _validate({
    ...self,
    emailVerified: true,
  });

export const UserFns = {
  create: createUser,
  patch: patchUser,
  updateEmail: updateEmail,
  markEmailAsVerified: markEmailAsVerified,
} as const;
