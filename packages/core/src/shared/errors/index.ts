import { Schema } from "effect";

export class MasonError extends Schema.TaggedError<MasonError>()(
  "shared/MasonError",
  {
    cause: Schema.Unknown,
  }
) {}
