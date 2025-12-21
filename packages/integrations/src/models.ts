import { Project } from "@mason/mason/models/project.model";
import { Schema } from "effect";

/** Custom date types */

export const OptionFromNonEmptyTrimmedStringMax = ({
  maxLength,
}: {
  maxLength: number;
}) =>
  Schema.transform(Schema.String, Schema.OptionFromNonEmptyTrimmedString, {
    strict: true,
    decode: (s: string) => s.trim().slice(0, maxLength),
    encode: (s: string) => s,
  });

/** Models */

export const ExternalProject = Schema.Struct({
  externalId: Schema.String,
  name: OptionFromNonEmptyTrimmedStringMax({ maxLength: 255 }),
  hexColor: Schema.optionalWith(Project.fields.hexColor, {
    exact: true,
  }),
  isBillable: Schema.optionalWith(Project.fields.isBillable, {
    exact: true,
  }),
  startDate: Schema.optionalWith(Project.fields.startDate, { exact: true }),
  endDate: Schema.optionalWith(Project.fields.endDate, { exact: true }),
  notes: Schema.optionalWith(Project.fields.notes, { exact: true }),
});

export const ExternalTask = Schema.Struct({
  externalId: Schema.String,
  externalProjectId: Schema.String,
  name: OptionFromNonEmptyTrimmedStringMax({ maxLength: 255 }),
});
