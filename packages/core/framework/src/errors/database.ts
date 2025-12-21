import { SqlError } from "@effect/sql/SqlError";
import { Schema } from "effect";
import { ParseError } from "effect/ParseResult";

export class DatabaseError extends Schema.TaggedError<DatabaseError>()(
  "@mason/framework/databaseError",
  {
    cause: Schema.Unknown,
  }
) {}

export type RepositoryError = SqlError | ParseError;