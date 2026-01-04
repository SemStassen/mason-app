import { Schema } from "effect";

export type JsonRecord = typeof JsonRecord.Type;
export const JsonRecord = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown,
});
