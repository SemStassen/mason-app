import { Option } from "effect";

/**
 * Safely merge two values, handling null, undefined, and Option cases.
 *
 * **For nullable values:**
 * - `undefined` update → keep current
 * - `null` update → return null
 * - Both are objects → merge (update takes precedence)
 *
 * **For Option values:**
 * - `undefined` update → keep current
 * - `Option.none()` update → return Option.none()
 * - Both are Some → merge inner values (update takes precedence)
 *
 * @category Utils
 * @since 0.1.0
 * @example
 * ```ts
 * import { Option } from "effect";
 * import { safeMerge } from "@mason/framework";
 *
 * // Nullable objects
 * safeMerge({ a: 1 }, undefined)        // { a: 1 }
 * safeMerge({ a: 1 }, null)             // null
 * safeMerge({ a: 1, b: 2 }, { b: 3 })   // { a: 1, b: 3 }
 *
 * // Option objects
 * safeMerge(Option.some({ a: 1 }), undefined)              // Option.some({ a: 1 })
 * safeMerge(Option.some({ a: 1 }), Option.none())          // Option.none()
 * safeMerge(Option.some({ a: 1 }), Option.some({ b: 2 }))  // Option.some({ a: 1, b: 2 })
 * ```
 */
export function safeMerge<T extends object>(
  current: Option.Option<T>,
  update: Option.Option<T> | undefined
): Option.Option<T>;
export function safeMerge<T extends object>(
  current: T | null,
  update: T | null | undefined
): T | null;
export function safeMerge<T extends object>(
  current: T | null | Option.Option<T>,
  update: T | null | undefined | Option.Option<T>
): T | null | Option.Option<T> {
  if (update === undefined) {
    return current;
  }

  // Option path
  if (Option.isOption(current)) {
    const updateOpt = update as Option.Option<T>;
    if (Option.isNone(updateOpt)) {
      return Option.none();
    }
    if (Option.isNone(current)) {
      return updateOpt;
    }
    return Option.some({ ...current.value, ...updateOpt.value });
  }

  // Nullable path
  if (update === null) {
    return null;
  }
  if (current === null) {
    return update as T;
  }
  return { ...(current as T), ...(update as T) };
}
