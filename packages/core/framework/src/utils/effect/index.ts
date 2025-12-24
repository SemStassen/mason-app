import { Effect, Option, Schema } from "effect";
import type { ProcessArray, WithNonEmptyArray } from "./types";

/**
 * @internal
 * Internal utility function used by processArray.
 * Validates an array and ensures it's non-empty, then applies a function to it.
 * If the array is empty or invalid, returns the `onEmpty` effect.
 */
const withNonEmptyArray: WithNonEmptyArray = (params) => {
  return Schema.decodeUnknown(Schema.NonEmptyArray(params.schema))(
    params.arr
  ).pipe(
    Effect.option,
    Effect.flatMap((maybe) =>
      Option.match(maybe, {
        onNone: () => params.onEmpty,
        onSome: params.execute,
      })
    )
  );
};

/**
 * Processes a batch of items: validates, optionally prepares context, optionally transforms, and executes a final action.
 * Returns the result of `onEmpty` if the input array is empty, otherwise returns the result of executing.
 *
 * `prepare` (optional) runs once on the entire array and provides context to `mapItem`.
 * `mapItem` (optional) processes each item, optionally using the context from `prepare`.
 * `execute` (required) performs the final action (insert, update, delete, etc.).
 *
 * Type flow:
 * - `prepare` input: `NonEmptyReadonlyArray<Schema.Schema.Type<In>>` (optional)
 * - `prepare` output: `Context` (if present)
 * - `mapItem` input: `Schema.Schema.Type<In>` and optionally `Context` (if `prepare` present)
 * - `mapItem` output: `OutFinal` (if present, otherwise uses input type)
 * - `execute` input: `NonEmptyReadonlyArray<OutFinal>` or `NonEmptyReadonlyArray<Schema.Schema.Type<In>>`
 *
 * @example
 * ```ts
 * import { Effect, Schema } from "effect";
 * import { processArray } from "@mason/framework/utils/effect";
 *
 * // Example 1: Simple execution without mapItem
 * const UserSchema = Schema.Struct({ name: Schema.String });
 *
 * processArray({
 *   items: [{ name: "Alice" }, { name: "Bob" }],
 *   schema: UserSchema,
 *   execute: (items) => {
 *     // items is inferred as NonEmptyReadonlyArray<{ name: string }>
 *     return repository.insert(items);
 *   },
 * });
 * ```
 *
 * @example
 * ```ts
 * import { Effect, Schema } from "effect";
 * import { processArray } from "@mason/framework/utils/effect";
 *
 * // Example 2: With mapItem
 * const UserSchema = Schema.Struct({ name: Schema.String });
 *
 * processArray({
 *   items: [{ name: "Alice" }, { name: "Bob" }],
 *   schema: UserSchema,
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
 * import { Effect, Schema } from "effect";
 * import { processArray } from "@mason/framework/utils/effect";
 *
 * // Example 3: With prepare and mapItem
 * const UpdateSchema = Schema.Struct({ id: Schema.String });
 *
 * processArray({
 *   items: [{ id: "1" }, { id: "2" }],
 *   schema: UpdateSchema,
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

  return withNonEmptyArray({
    arr: params.items,
    schema: params.schema,
    onEmpty: params.onEmpty ?? Effect.succeed(undefined as never),
    execute: (nea) =>
      Effect.gen(function* () {
        // Step 1: Run prepare if provided to get context
        const context = hasPrepare ? yield* params.prepare(nea) : undefined;

        // Step 2: Apply mapItem if provided (with context if prepare was used)
        const itemsToExecute = hasMapItem
          ? yield* Effect.forEach(
              nea,
              context !== undefined
                ? (item) =>
                    (
                      params.mapItem as (
                        item: unknown,
                        context: unknown
                      ) => Effect.Effect<unknown, unknown, unknown>
                    )(item, context)
                : (params.mapItem as (
                    item: unknown
                  ) => Effect.Effect<unknown, unknown, unknown>)
            )
          : nea;

        // Step 3: Execute (always receives items only, never context)
        return yield* (
          params.execute as (
            items: unknown
          ) => Effect.Effect<unknown, unknown, unknown>
        )(itemsToExecute);
      }),
  });
}) as ProcessArray;
