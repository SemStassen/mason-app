import { Schema } from "effect";

export class RepositoryError extends Schema.TaggedErrorClass<RepositoryError>()(
  "RepositoryError",
  {
    cause: Schema.Defect,
  }
) {}
