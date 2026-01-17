import { DateTime, Effect, Option } from "effect";

/**
 * Represents any entity that supports soft deletion.
 *
 * @category Types
 * @since 0.1.0
 */
interface SoftDeletable {
  readonly deletedAt: Option.Option<DateTime.Utc>;
}

/**
 * A validate function that constructs an entity from input.
 *
 * @category Types
 * @since 0.1.0
 */
type ValidateFn<T, E> = (input: T) => Effect.Effect<T, E>;

/**
 * Check if a soft-deletable entity is deleted.
 *
 * @example
 * ```ts
 * // In your TaggedClass:
 * isDeleted() {
 *   return SoftDeletable.isDeleted(this);
 * }
 * ```
 *
 * @category Predicates
 * @since 0.1.0
 */
export const isDeleted = <T extends SoftDeletable>(self: T): boolean =>
  Option.isSome(self.deletedAt);

/**
 * Soft delete an entity using its validate function.
 *
 * Returns the entity unchanged if already deleted,
 * otherwise sets `deletedAt` to the current time.
 *
 * @example
 * ```ts
 * // In your TaggedClass:
 * softDelete() {
 *   return SoftDeletable.softDelete(this, Member._validate);
 * }
 * ```
 *
 * @category Transformations
 * @since 0.1.0
 */
export const softDelete = <T extends SoftDeletable, E>(
  self: T,
  validate: ValidateFn<T, E>
): Effect.Effect<T, E> =>
  isDeleted(self)
    ? Effect.succeed(self)
    : Effect.gen(function* () {
        const deletedAt = yield* DateTime.now;
        return yield* validate({ ...self, deletedAt: Option.some(deletedAt) });
      });

/**
 * Restore a soft-deleted entity using its validate function.
 *
 * Sets `deletedAt` to `Option.none()`, making the entity active again.
 *
 * @example
 * ```ts
 * // In your TaggedClass:
 * restore() {
 *   return SoftDeletable.restore(this, Member._validate);
 * }
 * ```
 *
 * @category Transformations
 * @since 0.1.0
 */
export const restore = <T extends SoftDeletable, E>(
  self: T,
  validate: ValidateFn<T, E>
): Effect.Effect<T, E> => validate({ ...self, deletedAt: Option.none() });
