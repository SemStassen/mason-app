import { Array as Arr, Effect } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { ProcessArray } from "./types";

/**
 * Processes a batch of items: optionally prepares context, optionally transforms, and executes a final action.
 * Returns the result of `onEmpty` if the input array is empty, otherwise returns the result of executing.
 *
 * `prepare` (optional) runs once on the entire array and provides context to `mapItem`.
 * `mapItem` (optional) processes each item, optionally using the context from `prepare`.
 * `execute` (required) performs the final action (insert, update, delete, etc.).
 *
 * Type flow:
 * - `prepare` input: `NonEmptyReadonlyArray<Items[number]>` (optional)
 * - `prepare` output: `Context` (if present)
 * - `mapItem` input: `Items[number]` and optionally `Context` (if `prepare` present)
 * - `mapItem` output: `OutFinal` (if present, otherwise uses input type)
 * - `execute` input: `NonEmptyReadonlyArray<OutFinal>` or `NonEmptyReadonlyArray<Items[number]>`
 *
 * @example
 * ```ts
 * import { Effect } from "effect";
 * import { processArray } from "@mason/framework";
 *
 * // Example 1: Simple execution without mapItem
 * processArray({
 *   items: [{ name: "Alice" }, { name: "Bob" }],
 *   execute: (items) => {
 *     // items is inferred as NonEmptyReadonlyArray<{ name: string }>
 *     return repository.insert(items);
 *   },
 * });
 * ```
 *
 * @example
 * ```ts
 * import { Effect } from "effect";
 * import { processArray } from "@mason/framework";
 *
 * // Example 2: With mapItem
 * processArray({
 *   items: [{ name: "Alice" }, { name: "Bob" }],
 *   mapItem: (item) => {
 *     // item is inferred as { name: string }
 *     return Effect.succeed({ ...item, id: crypto.randomUUID() });
 *   },
 *   execute: (items) => {
 *     // items is inferred as NonEmptyReadonlyArray<{ name: string; id: string }>
 *     return repository.insert(items);
 *   },
 * });
 * ```
 *
 * @example
 * ```ts
 * import { Effect } from "effect";
 * import { processArray } from "@mason/framework";
 *
 * // Example 3: With prepare and mapItem
 * processArray({
 *   items: [{ id: "1" }, { id: "2" }],
 *   prepare: (updates) =>
 *     Effect.gen(function* () {
 *       const existing = yield* fetchExisting(updates.map((u) => u.id));
 *       return new Map(existing.map((e) => [e.id, e]));
 *     }),
 *   mapItem: (update, existingMap) => {
 *     // update is inferred as { id: string }
 *     // existingMap is inferred as Map<string, ExistingEntity>
 *     const existing = existingMap.get(update.id);
 *     return Effect.succeed({ ...existing, ...update });
 *   },
 *   execute: (items) => repository.update(items),
 * });
 * ```
 *
 * @category utilities
 */
export const processArray = ((params: Parameters<ProcessArray>[0]) => {
  const hasPrepare = "prepare" in params && params.prepare;
  const hasMapItem = "mapItem" in params && params.mapItem;

  // Helper to call mapItem with proper typing based on whether prepare exists
  const callMapItem = (
    mapItem: typeof params.mapItem,
    item: unknown,
    context: unknown
  ): Effect.Effect<unknown, unknown, unknown> => {
    if (hasPrepare && context !== undefined) {
      return (
        mapItem as (
          item: unknown,
          context: unknown
        ) => Effect.Effect<unknown, unknown, unknown>
      )(item, context);
    }
    return (
      mapItem as (item: unknown) => Effect.Effect<unknown, unknown, unknown>
    )(item);
  };

  const executeFn = (nea: NonEmptyReadonlyArray<unknown>) =>
    Effect.gen(function* () {
      // Step 1: Run prepare if provided to get context
      const context = hasPrepare ? yield* params.prepare(nea) : undefined;

      // Step 2: Apply mapItem if provided (with context if prepare was used)
      const itemsToExecute = hasMapItem
        ? yield* Effect.forEach(nea, (item) =>
            callMapItem(params.mapItem, item, context)
          )
        : nea;

      // Step 3: Execute (always receives items only, never context)
      return yield* params.execute(itemsToExecute);
    });

  // Check if array is non-empty
  const maybeNonEmpty = Arr.isNonEmptyReadonlyArray(params.items)
    ? params.items
    : undefined;

  if (maybeNonEmpty) {
    return executeFn(maybeNonEmpty);
  }

  return params.onEmpty ?? Effect.succeed(undefined as never);
}) as ProcessArray;
