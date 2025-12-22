import { Schema } from "effect";

export type ApiKey = typeof ApiKey.Type;
export const ApiKey = Schema.NonEmptyString.pipe(Schema.brand("ApiKey"));
