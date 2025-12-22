import { Schema } from "effect";

export class InternalTimeTrackingModuleError extends Schema.TaggedError<InternalTimeTrackingModuleError>()(
  "time-tracking/InternalTimeTrackingModuleError",
  {
    cause: Schema.Unknown,
  }
) {}
