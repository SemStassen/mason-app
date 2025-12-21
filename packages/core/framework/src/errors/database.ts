import { Schema } from "effect";

export class DatabaseError extends Schema.TaggedError<DatabaseError>()(
  "@mason/framework/databaseError",
  {
    cause: Schema.Unknown,
  }
) {}