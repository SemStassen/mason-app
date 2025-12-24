import { TimeEntryId } from "@mason/framework";
import { Schema } from "effect";

export class InternalTimeTrackingModuleError extends Schema.TaggedError<InternalTimeTrackingModuleError>()(
  "time-tracking/InternalTimeTrackingModuleError",
  {
    cause: Schema.Unknown,
  }
) {}

export class TimeEntryNotFoundError extends Schema.TaggedError<TimeEntryNotFoundError>()(
  "time-tracking/TimeEntryNotFoundError",
  {
    timeEntryId: TimeEntryId,
  }
) {}
