import type { ParseResult } from "effect";
import { DateTime, Effect, Option } from "effect";
import type { MakeFn, SoftDeletable } from "./types";

export type { MakeFn, SoftDeletable } from "./types";

// =============================================================================
// Predicates
// =============================================================================

/**
 * Check if a soft-deletable entity is deleted.
 *
 * @example
 * ```ts
 * import { SoftDeletable } from "@mason/framework";
 *
 * // Use directly
 * if (SoftDeletable.isDeleted(project)) {
 *   console.log("Project is deleted");
 * }
 *
 * // Or re-export from your domain
 * export const isDeleted = SoftDeletable.isDeleted;
 * ```
 *
 * @category Predicates
 * @since 0.1.0
 */
export const isDeleted = <T extends SoftDeletable>(self: T): boolean =>
  Option.isSome(self.deletedAt);

// =============================================================================
// Transformations
// =============================================================================

/**
 * Creates a soft delete function for an entity.
 *
 * Returns the entity unchanged if already deleted,
 * otherwise sets `deletedAt` to the current time.
 *
 * @example
 * ```ts
 * import { SoftDeletable } from "@mason/framework";
 *
 * // In your domain functions file:
 * const make = (input: Project) => Schema.decodeUnknown(Project)(input);
 *
 * export const softDelete = SoftDeletable.makeSoftDelete(make);
 *
 * // Usage:
 * const deletedProject = yield* softDelete(project);
 * ```
 *
 * @category Transformations
 * @since 0.1.0
 */
export const makeSoftDelete =
  <T extends SoftDeletable>(make: MakeFn<T>) =>
  (self: T): Effect.Effect<T, ParseResult.ParseError> =>
    Effect.gen(function* () {
      if (isDeleted(self)) {
        return self;
      }
      const deletedAt = yield* DateTime.now;
      return yield* make({ ...self, deletedAt: Option.some(deletedAt) });
    });

/**
 * Creates a restore function for a soft-deleted entity.
 *
 * Sets `deletedAt` to `Option.none()`, making the entity active again.
 *
 * @example
 * ```ts
 * import { SoftDeletable } from "@mason/framework";
 *
 * // In your domain functions file:
 * const make = (input: Project) => Schema.decodeUnknown(Project)(input);
 *
 * export const restore = SoftDeletable.makeRestore(make);
 *
 * // Usage:
 * const restoredProject = yield* restore(deletedProject);
 * ```
 *
 * @category Transformations
 * @since 0.1.0
 */
export const makeRestore =
  <T extends SoftDeletable>(make: MakeFn<T>) =>
  (self: T): Effect.Effect<T, ParseResult.ParseError> =>
    make({ ...self, deletedAt: Option.none() });
