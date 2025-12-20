import { HttpApiEndpoint, HttpApiError, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";
import { TimeEntryResponse } from "../dto/time-entry.dto";

export const TimeEntryGroup = HttpApiGroup.make("TimeEntry").add(
  HttpApiEndpoint.get("List")`/`
    .addSuccess(Schema.Array(TimeEntryResponse))
    .addError(HttpApiError.InternalServerError)
);
