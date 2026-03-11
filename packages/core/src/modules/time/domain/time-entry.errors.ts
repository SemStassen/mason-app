import { Schema } from "effect";

export class TimeEntryStoppedAtBeforeStartedAtError extends Schema.TaggedErrorClass<TimeEntryStoppedAtBeforeStartedAtError>()(
	"time/TimeEntryStoppedAtBeforeStartedAtError",
	{},
) {}

export class TimeEntryAlreadyStoppedError extends Schema.TaggedErrorClass<TimeEntryAlreadyStoppedError>()(
	"time/TimeEntryAlreadyStoppedError",
	{},
) {}

export class TimeEntryNotRunningError extends Schema.TaggedErrorClass<TimeEntryNotRunningError>()(
	"time/TimeEntryNotRunningError",
	{},
) {}

export class TimeEntryAlreadyRunningError extends Schema.TaggedErrorClass<TimeEntryAlreadyRunningError>()(
	"time/TimeEntryAlreadyRunningError",
	{},
) {}
