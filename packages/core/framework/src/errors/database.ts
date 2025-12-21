import type { SqlError } from "@effect/sql/SqlError";
import { Schema } from "effect";
import type { ParseError } from "effect/ParseResult";

export class DatabaseError extends Schema.TaggedError<DatabaseError>()(
  "@mason/framework/databaseError",
  {
    cause: Schema.Unknown,
  }
) {}

export type RepositoryError = SqlError | ParseError;
