import { Schema } from "effect";

export const NonEmptyTrimmedString = Schema.Trimmed.check(Schema.isNonEmpty());

export const optionalNullableOptionKey = <S extends Schema.Top>(schema: S) =>
  Schema.optionalKey(Schema.OptionFromNullOr(schema));

export const optionalKeyWithDecodingDefault = <S extends Schema.Top>(params: {
  schema: S;
  defaultValue: () => S["Encoded"];
}) =>
  params.schema.pipe(
    Schema.withDecodingDefaultKey(params.defaultValue, {
      encodingStrategy: "omit",
    })
  );

export * from "effect/Schema";
