import type { Schema } from "effect";

/**
 * Creates a type that is Encoded (input format) except for specified keys, which use Type (branded).
 *
 * This is useful for DTOs where you want IDs and other branded fields to remain typed,
 * while other fields use their encoded (unbranded) representation.
 *
 * Uses Effect Schema primitives:
 * - `Schema.Schema.Encoded<TSchema>` to extract the encoded (unbranded) type from the schema
 * - `Schema.Schema.Type<FieldSchema>` to extract branded types from field schemas
 * - Works with both `Schema.Class` fields (with `.Type` property) and `Schema.Struct` fields (schemas)
 *
 * @example
 * // With Schema.Class fields (has .Type property)
 * type MyDTO = EncodedExcept<
 *   typeof MySchema,
 *   typeof MyModel.fields,  // Class fields with .Type
 *   "id" | "projectId"     // These keys use Type instead of Encoded
 * >;
 *
 * @example
 * // With Schema.Struct fields (schemas directly)
 * type MyDTO = EncodedExcept<
 *   typeof MyStructSchema,
 *   typeof MyStructSchema.fields,  // Struct fields are schemas
 *   "id" | "projectId"              // These keys use Type instead of Encoded
 * >;
 */
export type EncodedExcept<
  TSchema extends Schema.Schema.Any,
  TFields extends
    | Record<string, { Type: unknown }> // Schema.Class fields (has .Type property)
    | Readonly<Record<string, unknown>>, // Schema.Struct fields (any schema type - relaxed constraint)
  BrandedKeys extends keyof TFields = never,
> = {
  [K in keyof Schema.Schema.Encoded<TSchema>]: K extends BrandedKeys
    ? TFields[K] extends { Type: infer T }
      ? T // Schema.Class field: use .Type property
      : TFields[K] extends Schema.Schema.Any
        ? Schema.Schema.Type<TFields[K]> // Schema.Struct field: use Schema.Schema.Type utility
        : Schema.Schema.Encoded<TSchema>[K]
    : Schema.Schema.Encoded<TSchema>[K]; // use Schema.Schema.Encoded utility for unbranded fields
};
