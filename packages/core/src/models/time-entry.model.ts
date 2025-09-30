import { Schema } from "effect";
import { generateUUID } from "../utils/uuid";
import { TimeEntryId } from "./ids";

export class TimeEntry extends Schema.Struct({
  id: Schema.optionalWith(TimeEntryId, {
    default: () => TimeEntryId.make(generateUUID()),
  }),
}) {}
