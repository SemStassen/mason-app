import type { Schema } from "effect";

export type SchemaFields<T extends { fields: Schema.Struct.Fields }> =
  Schema.Struct.Type<T["fields"]>;

export type AtLeastOne<T> = {
  [K in keyof T]: Required<Pick<T, K>> & Partial<Omit<T, K>>;
}[keyof T];
