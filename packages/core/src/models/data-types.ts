import { Schema } from "effect";

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
