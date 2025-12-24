import { Schema } from "effect";

export const JsonRecord = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown,
});
