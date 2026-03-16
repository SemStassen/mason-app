import { Schema } from "effect";

export const NonEmptyTrimmedString = Schema.Trimmed.check(Schema.isNonEmpty());

export * from "effect/Schema";
