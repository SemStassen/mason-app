import { Effect, Option, Schema } from "effect";
import { dual } from "effect/Function";
import { MemberId, type UserId, type WorkspaceId } from "~/shared/schemas";
import {
  generateUUID,
  isDeleted,
  makeRestore,
  makeSoftDelete,
} from "~/shared/utils";
import { Member } from "../schemas/member.model";
import { MemberDomainError } from "./errors";

// =============================================================================
// Constructors
// =============================================================================

/** Internal: validates and constructs a Member via Schema. */
const _validate = (input: Member): Effect.Effect<Member, MemberDomainError> =>
  Schema.validate(Member)(input).pipe(
    Effect.catchTags({
      ParseError: (e) => Effect.fail(new MemberDomainError({ cause: e })),
    })
  );

/** Default values for new members. */
const defaults = {
  deletedAt: Option.none(),
} as const;

/**
 * Create a new member with generated ID.
 *
 * @category Constructors
 * @since 0.1.0
 */
const createMember = (input: {
  userId: UserId;
  workspaceId: WorkspaceId;
  role: Member["role"];
}): Effect.Effect<Member, MemberDomainError> =>
  _validate({
    ...defaults,
    ...input,
    id: MemberId.make(generateUUID()),
    _tag: "Member",
  });

// =============================================================================
// Predicates
// =============================================================================

/**
 * Check if member is deleted.
 *
 * @category Predicates
 * @since 0.1.0
 */
const isMemberDeleted = isDeleted;

// =============================================================================
// Transformations
// =============================================================================

interface PatchMember {
  role?: Member["role"];
}

/**
 * Update a member with patch data.
 *
 * @category Transformations
 * @since 0.1.0
 */
const updateMember = dual<
  (
    patch: PatchMember
  ) => (self: Member) => Effect.Effect<Member, MemberDomainError>,
  (self: Member, patch: PatchMember) => Effect.Effect<Member, MemberDomainError>
>(2, (self, patch) =>
  _validate({
    ...self,
    ...patch,
    id: self.id,
  })
);

/**
 * Soft delete a member.
 *
 * @category Transformations
 * @since 0.1.0
 */
const softDeleteMember = makeSoftDelete(_validate);

/**
 * Restore a soft-deleted member.
 *
 * @category Transformations
 * @since 0.1.0
 */
const restoreMember = makeRestore(_validate);

export const MemberFns = {
  create: createMember,
  update: updateMember,
  softDelete: softDeleteMember,
  restore: restoreMember,
  isDeleted: isMemberDeleted,
} as const;
