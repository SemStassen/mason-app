import type { NonEmptyReadonlyArray } from "effect/Array";

/**
 * Maps a non-empty readonly array to another non-empty readonly array.
 * Preserves the non-empty guarantee in the type system.
 *
 * @example
 * ```ts
 * import { mapNonEmptyArray } from "~/shared/utils/array";
 *
 * const invitations = [{ id: "1" }, { id: "2" }] as const;
 * const ids = mapNonEmptyArray(invitations, (inv) => inv.id);
 * // ids: NonEmptyReadonlyArray<string>
 * ```
 *
 * @category utilities
 * @since 0.1.0
 */
export function mapNonEmptyArray<T, U>(
  arr: NonEmptyReadonlyArray<T>,
  fn: (item: T) => U
): NonEmptyReadonlyArray<U> {
  return arr.map(fn) as unknown as NonEmptyReadonlyArray<U>;
}
