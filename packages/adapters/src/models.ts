import { JsonRecord } from "@mason/framework";
import { Schema } from "effect";

export type ExternalProject = typeof ExternalProject.Type;
export const ExternalProject = Schema.Struct({
  externalId: Schema.NonEmptyString,
  name: Schema.OptionFromSelf(Schema.String),
  hexColor: Schema.OptionFromSelf(Schema.String),
  isBillable: Schema.OptionFromSelf(Schema.Boolean),
  startDate: Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf),
  endDate: Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf),
  notes: Schema.OptionFromSelf(JsonRecord),
});

export type ExternalTask = typeof ExternalTask.Type;
export const ExternalTask = Schema.Struct({
  externalId: Schema.NonEmptyString,
  externalProjectId: Schema.NonEmptyString,
  name: Schema.OptionFromSelf(Schema.String),
});
