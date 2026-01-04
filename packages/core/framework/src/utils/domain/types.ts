import type { DateTime, Effect, Option, ParseResult } from "effect";

/**
 * Represents any entity that supports soft deletion.
 * Entities with a `deletedAt` field of `Option<DateTime.Utc>` can use the
 * soft-deletable utilities.
 *
 * @category Types
 * @since 0.1.0
 */
export interface SoftDeletable {
  readonly deletedAt: Option.Option<DateTime.Utc>;
}

/**
 * A make function that validates and constructs an entity via Schema.
 *
 * @category Types
 * @since 0.1.0
 */
export type MakeFn<T> = (input: T) => Effect.Effect<T, ParseResult.ParseError>;
