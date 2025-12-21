import { Schema } from "effect";

export class GenericProjectModuleError extends Schema.TaggedError<GenericProjectModuleError>()(
  "@mason/project/GenericProjectModuleError",
  {
    cause: Schema.Unknown,
  }
) {}

export type ProjectModuleError = typeof ProjectModuleError.Type
export const ProjectModuleError = Schema.Union(GenericProjectModuleError)