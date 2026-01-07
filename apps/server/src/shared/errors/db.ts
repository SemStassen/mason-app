import { Schema } from "effect";

export class DatabaseError extends Schema.TaggedError<DatabaseError>()(
  "shared/DatabaseError",
  {
    cause: Schema.Unknown,
  }
) {}
