import type { Brand, Redacted } from "effect";
import { Schema } from "effect";

export const JsonRecord = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown,
});

/**
 * Type utility that simplifies all branded types to their underlying types,
 * but preserves Redacted wrappers.
 *
 * This is useful for DTOs where you want:
 * - Plain strings instead of branded IDs (WorkspaceId → string)
 * - But keep Redacted types as-is (Redacted<...> stays Redacted<...>)
 *
 * Note: Use with `.Type` not `.Encoded`, since `.Encoded` already strips Redacted.
 *
 * @example
 * ```ts
 * type Simplified = SimplifyExceptRedacted<typeof MySchema.Type>;
 * // WorkspaceId becomes string, but Redacted<ApiKey> stays Redacted<ApiKey>
 * ```
 */
export type SimplifyExceptRedacted<T> = T extends Redacted<infer R>
  ? Redacted<SimplifyExceptRedacted<R>>
  : T extends Brand<any>
    ? Brand.Unbranded<T>
    : T extends object
      ? {
          readonly [K in keyof T]: SimplifyExceptRedacted<T[K]>;
        }
      : T extends ReadonlyArray<infer U>
        ? ReadonlyArray<SimplifyExceptRedacted<U>>
        : T;
