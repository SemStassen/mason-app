import { type Effect, Option, type ParseResult, Schema } from "effect";
import { dual } from "effect/Function";
import { MemberId, type UserId, type WorkspaceId } from "~/shared/schemas";
import {
  generateUUID,
  isDeleted,
  makeRestore,
  makeSoftDelete,
} from "~/shared/utils";
import { Member } from "../schemas/member.model";

// =============================================================================
// Constructors
// =============================================================================

/** Internal: validates and constructs a Member via Schema. */
const _make = (input: Member): Effect.Effect<Member, ParseResult.ParseError> =>
  Schema.validate(Member)(input);

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
const createMember = (
  input: {
    userId: UserId;
    role: Member["role"];
  },
  system: {
    workspaceId: WorkspaceId;
  }
): Effect.Effect<Member, ParseResult.ParseError> =>
  _make({
    ...defaults,
    ...input,
    workspaceId: system.workspaceId,
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
  ) => (self: Member) => Effect.Effect<Member, ParseResult.ParseError>,
  (
    self: Member,
    patch: PatchMember
  ) => Effect.Effect<Member, ParseResult.ParseError>
>(2, (self, patch) =>
  _make({
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
const softDeleteMember = makeSoftDelete(_make);

/**
 * Restore a soft-deleted member.
 *
 * @category Transformations
 * @since 0.1.0
 */
const restoreMember = makeRestore(_make);

export const MemberFns = {
  create: createMember,
  update: updateMember,
  softDelete: softDeleteMember,
  restore: restoreMember,
  isDeleted: isMemberDeleted,
} as const;
