import { Schema, SchemaGetter } from "effect";

export const emptyStringAsUndefined = Schema.Undefined.pipe(
  Schema.encodeTo(Schema.Literal(""), {
    decode: SchemaGetter.transform(() => undefined),
    encode: SchemaGetter.transform(() => "" as const),
  })
);

export const optionalFromEmptyString = <S extends Schema.Top>(schema: S) =>
  Schema.Union([emptyStringAsUndefined, schema]);
