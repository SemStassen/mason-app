import { Schema } from "effect";

export class DatabaseError extends Schema.TaggedError<DatabaseError>()(
  "@mason/framework/DatabaseError",
  {
    cause: Schema.Unknown,
  }
) {}
