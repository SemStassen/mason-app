import type { SqlError } from "@effect/sql/SqlError";
import type { ParseError } from "effect/ParseResult";

export type RepositoryError = SqlError | ParseError;
