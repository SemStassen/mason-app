import { Schema } from "effect";

class TimeEntry extends Schema.Struct({
  id: Schema.NonEmptyString,
}) {}
