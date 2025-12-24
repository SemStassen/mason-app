import { JsonRecord } from "@mason/framework";
import { Schema } from "effect";
import { OptionFromNonEmptyTrimmedString } from "effect/Schema";

export type ExternalProject = typeof ExternalProject.Type;
export const ExternalProject = Schema.Struct({
  externalId: Schema.String,
  name: OptionFromNonEmptyTrimmedString,
  hexColor: Schema.optionalWith(
    Schema.NonEmptyString.pipe(Schema.maxLength(9)),
    { exact: true }
  ),
  isBillable: Schema.optionalWith(Schema.Boolean, { exact: true }),
  startDate: Schema.optionalWith(Schema.DateFromSelf, { exact: true }),
  endDate: Schema.optionalWith(Schema.DateFromSelf, { exact: true }),
  notes: Schema.optionalWith(JsonRecord, { exact: true }),
});

export type ExternalTask = typeof ExternalTask.Type;
export const ExternalTask = Schema.Struct({
  externalId: Schema.String,
  externalProjectId: Schema.String,
  name: OptionFromNonEmptyTrimmedString,
});
