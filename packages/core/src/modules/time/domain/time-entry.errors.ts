import { Schema } from "effect";

export class TimeEntryStoppedAtBeforeStartedAtError extends Schema.TaggedErrorClass<TimeEntryStoppedAtBeforeStartedAtError>()(
  "time/TimeEntryStoppedAtBeforeStartedAtError",
  {}
) {}

export class TimeEntryAlreadyRunningError extends Schema.TaggedErrorClass<TimeEntryAlreadyRunningError>()(
  "time/TimeEntryAlreadyRunningError",
  {}
) {}
