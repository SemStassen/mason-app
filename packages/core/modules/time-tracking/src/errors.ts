import { Schema } from "effect";

export class GenericTimeTrackingModuleError extends Schema.TaggedError<GenericTimeTrackingModuleError>()(
  "@mason/time-tracking/GenericTimeTrackingModuleError",
  {
    cause: Schema.Unknown,
  }
) {}

export type TimeTrackingModuleError = typeof TimeTrackingModuleError.Type;
export const TimeTrackingModuleError = Schema.Union(
  GenericTimeTrackingModuleError
);
