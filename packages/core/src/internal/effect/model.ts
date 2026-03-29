import { Schema } from "effect";
import { VariantSchema } from "effect/unstable/schema";

const {
  Class,
  Field,
  FieldExcept,
  FieldOnly,
  Struct,
  Union,
  extract,
  fieldEvolve,
} = VariantSchema.make({
  variants: ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"],
  defaultVariant: "select",
});

export {
  Class,
  Field,
  FieldExcept,
  FieldOnly,
  Struct,
  Union,
  extract,
  fieldEvolve,
};

const optionalNullableOptionKey = <S extends Schema.Top>(schema: S) =>
  Schema.optionalKey(Schema.OptionFromNullOr(schema));

const optionalKeyWithDecodingDefault = <S extends Schema.Top>(params: {
  schema: S;
  defaultValue: () => S["Encoded"];
}) =>
  params.schema.pipe(
    Schema.withDecodingDefaultKey(params.defaultValue, {
      encodingStrategy: "omit",
    })
  );

/**
 * Named helpers cover the common matrix of shared DB and JSON contracts.
 *
 * Reach for `Field(...)` directly when a field has asymmetric behavior across
 * variants, such as different DB/JSON schemas or omitted JSON read variants.
 *
 * Naming rules:
 * - Start with the authoritative server contract: `ServerImmutable` or
 *   `ServerMutable`
 * - Add the client contract only when client input is part of the field's API:
 *   `ClientImmutable` or `ClientMutable`
 * - Append whole-field modifiers last: `Optional`, `CreateOptional`,
 *   `CreateDefault`
 * - `Optional` describes the field shape as a whole, not a separate per-actor
 *   contract
 * - If the name starts to describe transport quirks instead of the core
 *   contract, prefer an explicit `Field(...)`
 *
 * Grammar:
 * `Server<Mutability>[Client<Mutability>][FieldModifier][CreateModifier]`
 */

// ---------------------------------------------------------------------------
// ServerImmutable
// ---------------------------------------------------------------------------

export interface ServerImmutable<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly select: S;
  readonly insert: S;
  readonly json: S;
}> {}

/**
 * Field set once by the server and never updated.
 *
 * Absent from the update variant and all JSON input variants.
 *
 * @example
 * id: ServerImmutable(WorkspaceId)
 * createdAt: ServerImmutable(Timestamp)
 */
export const ServerImmutable = <S extends Schema.Top>(
  schema: S
): ServerImmutable<S> =>
  Field({
    select: schema,
    insert: schema,
    json: schema,
  });

// ---------------------------------------------------------------------------
// ServerMutable
// ---------------------------------------------------------------------------

export interface ServerMutable<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly select: S;
  readonly insert: S;
  readonly update: Schema.optionalKey<S>;
  readonly json: S;
}> {}

/**
 * Field managed entirely by the server over the entity lifecycle.
 *
 * Absent from all client-facing create and update payloads.
 *
 * @example
 * emailVerified: ServerMutable(Schema.Boolean)
 * status: ServerMutable(Schema.Literals(["pending", "accepted"]))
 */
export const ServerMutable = <S extends Schema.Top>(
  schema: S
): ServerMutable<S> =>
  Field({
    select: schema,
    insert: schema,
    update: Schema.optionalKey(schema),
    json: schema,
  });

// ---------------------------------------------------------------------------
// ServerMutableOptional
// ---------------------------------------------------------------------------

export interface ServerMutableOptional<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly select: Schema.OptionFromNullOr<S>;
  readonly insert: Schema.OptionFromNullOr<S>;
  readonly update: Schema.optionalKey<Schema.OptionFromNullOr<S>>;
  readonly json: Schema.OptionFromNullOr<S>;
}> {}

/**
 * Optional field managed entirely by the server.
 *
 * DB variants use OptionFromNullOr so SQL NULLs decode to None.
 *
 * @example
 * archivedAt: ServerMutableOptional(Schema.DateTimeUtcFromDate)
 * activeWorkspaceId: ServerMutableOptional(WorkspaceId)
 */
export const ServerMutableOptional = <S extends Schema.Top>(
  schema: S
): ServerMutableOptional<S> =>
  Field({
    select: Schema.OptionFromNullOr(schema),
    insert: Schema.OptionFromNullOr(schema),
    update: Schema.optionalKey(Schema.OptionFromNullOr(schema)),
    json: Schema.OptionFromNullOr(schema),
  });

// ---------------------------------------------------------------------------
// ServerImmutableClientImmutableCreateOptional
// ---------------------------------------------------------------------------

export interface ServerImmutableClientImmutableCreateOptional<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly select: S;
  readonly insert: S;
  readonly json: S;
  readonly jsonCreate: Schema.OptionFromOptionalKey<S>;
}> {}

/**
 * Field immutable to both server and client after insert, but optional in the
 * client create payload.
 *
 * Useful for IDs that can be client-supplied for optimistic writes and
 * server-generated when omitted.
 *
 * @example
 * id: ServerImmutableClientImmutableCreateOptional(ProjectId)
 */
export const ServerImmutableClientImmutableCreateOptional = <
  S extends Schema.Top,
>(
  schema: S
): ServerImmutableClientImmutableCreateOptional<S> =>
  Field({
    select: schema,
    insert: schema,
    json: schema,
    jsonCreate: Schema.OptionFromOptionalKey(schema),
  });

// ---------------------------------------------------------------------------
// ServerImmutableClientImmutable
// ---------------------------------------------------------------------------

export interface ServerImmutableClientImmutable<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly select: S;
  readonly insert: S;
  readonly json: S;
  readonly jsonCreate: S;
}> {}

/**
 * Field the client must provide on create and that is immutable for both
 * server and client after insert.
 *
 * @example
 * provider: ServerImmutableClientImmutable(WorkspaceIntegrationProvider)
 */
export const ServerImmutableClientImmutable = <S extends Schema.Top>(
  schema: S
): ServerImmutableClientImmutable<S> =>
  Field({
    select: schema,
    insert: schema,
    json: schema,
    jsonCreate: schema,
  });

// ---------------------------------------------------------------------------
// ServerMutableClientImmutable
// ---------------------------------------------------------------------------

export interface ServerMutableClientImmutable<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly select: S;
  readonly insert: S;
  readonly update: Schema.optionalKey<S>;
  readonly json: S;
  readonly jsonCreate: S;
}> {}

/**
 * Field the client must provide on create and cannot update afterward.
 *
 * The server retains an internal update escape hatch via the update variant.
 *
 * @example
 * email: ServerMutableClientImmutable(Email)
 */
export const ServerMutableClientImmutable = <S extends Schema.Top>(
  schema: S
): ServerMutableClientImmutable<S> =>
  Field({
    select: schema,
    insert: schema,
    update: Schema.optionalKey(schema),
    json: schema,
    jsonCreate: schema,
  });

// ---------------------------------------------------------------------------
// ServerMutableClientMutable
// ---------------------------------------------------------------------------

export interface ServerMutableClientMutable<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly select: S;
  readonly insert: S;
  readonly update: Schema.optionalKey<S>;
  readonly json: S;
  readonly jsonCreate: S;
  readonly jsonUpdate: Schema.optionalKey<S>;
}> {}

/**
 * Required field the client can provide on create and update freely.
 *
 * @example
 * name: ServerMutableClientMutable(Schema.NonEmptyTrimmedString)
 */
export const ServerMutableClientMutable = <S extends Schema.Top>(
  schema: S
): ServerMutableClientMutable<S> =>
  Field({
    select: schema,
    insert: schema,
    update: Schema.optionalKey(schema),
    json: schema,
    jsonCreate: schema,
    jsonUpdate: Schema.optionalKey(schema),
  });

// ---------------------------------------------------------------------------
// ServerMutableClientMutableCreateOptional
// ---------------------------------------------------------------------------

export interface ServerMutableClientMutableCreateOptional<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly select: S;
  readonly insert: S;
  readonly update: Schema.optionalKey<S>;
  readonly json: S;
  readonly jsonCreate: Schema.optionalKey<S>;
  readonly jsonUpdate: Schema.optionalKey<S>;
}> {}

/**
 * Required field the client can update freely, but may omit on create.
 *
 * When absent from the create payload, the value must be derived by the
 * service layer before calling the repository.
 *
 * @example
 * displayName: ServerMutableClientMutableCreateOptional(NonEmptyTrimmedString)
 */
export const ServerMutableClientMutableCreateOptional = <S extends Schema.Top>(
  schema: S
): ServerMutableClientMutableCreateOptional<S> =>
  Field({
    select: schema,
    insert: schema,
    update: Schema.optionalKey(schema),
    json: schema,
    jsonCreate: Schema.optionalKey(schema),
    jsonUpdate: Schema.optionalKey(schema),
  });

// ---------------------------------------------------------------------------
// ServerMutableClientMutableCreateDefault
// ---------------------------------------------------------------------------

export interface ServerMutableClientMutableCreateDefault<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly select: S;
  readonly insert: S;
  readonly update: Schema.optionalKey<S>;
  readonly json: S;
  readonly jsonCreate: Schema.withDecodingDefaultKey<S>;
  readonly jsonUpdate: Schema.optionalKey<S>;
}> {}

/**
 * Mutable field that can be omitted on create and defaults during decoding.
 *
 * @example
 * hexColor: ServerMutableClientMutableCreateDefault(HexColor, { defaultValue: () => HexColor.makeUnsafe("#000000") })
 */
export const ServerMutableClientMutableCreateDefault = <S extends Schema.Top>(
  schema: S,
  options: {
    readonly defaultValue: () => S["Encoded"];
  }
): ServerMutableClientMutableCreateDefault<S> =>
  Field({
    select: schema,
    insert: schema,
    update: Schema.optionalKey(schema),
    json: schema,
    jsonCreate: optionalKeyWithDecodingDefault({
      schema,
      defaultValue: options.defaultValue,
    }),
    jsonUpdate: Schema.optionalKey(schema),
  });

// ---------------------------------------------------------------------------
// ServerMutableClientMutableOptional
// ---------------------------------------------------------------------------

export interface ServerMutableClientMutableOptional<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly select: Schema.OptionFromNullOr<S>;
  readonly insert: Schema.OptionFromNullOr<S>;
  readonly update: Schema.optionalKey<Schema.OptionFromNullOr<S>>;
  readonly json: Schema.OptionFromNullOr<S>;
  readonly jsonCreate: Schema.optionalKey<Schema.OptionFromNullOr<S>>;
  readonly jsonUpdate: Schema.optionalKey<Schema.OptionFromNullOr<S>>;
}> {}

/**
 * Optional field the client can create, update, clear, or leave unchanged.
 *
 * @example
 * logoUrl: ServerMutableClientMutableOptional(Schema.NonEmptyTrimmedString)
 */
export const ServerMutableClientMutableOptional = <S extends Schema.Top>(
  schema: S
): ServerMutableClientMutableOptional<S> =>
  Field({
    select: Schema.OptionFromNullOr(schema),
    insert: Schema.OptionFromNullOr(schema),
    update: Schema.optionalKey(Schema.OptionFromNullOr(schema)),
    json: Schema.OptionFromNullOr(schema),
    jsonCreate: optionalNullableOptionKey(schema),
    jsonUpdate: optionalNullableOptionKey(schema),
  });

// ---------------------------------------------------------------------------
// ServerMutableClientMutableOptionalCreateDefault
// ---------------------------------------------------------------------------

export interface ServerMutableClientMutableOptionalCreateDefault<
  S extends Schema.Top,
> extends VariantSchema.Field<{
  readonly select: Schema.OptionFromNullOr<S>;
  readonly insert: Schema.OptionFromNullOr<S>;
  readonly update: Schema.optionalKey<Schema.OptionFromNullOr<S>>;
  readonly json: Schema.OptionFromNullOr<S>;
  readonly jsonCreate: Schema.withDecodingDefaultKey<
    Schema.OptionFromNullOr<S>
  >;
  readonly jsonUpdate: Schema.optionalKey<Schema.OptionFromNullOr<S>>;
}> {}

/**
 * Optional mutable field that can be omitted on create and defaults during
 * decoding.
 *
 * @example
 * notes: ServerMutableClientMutableOptionalCreateDefault(Schema.Json, { defaultValue: () => null })
 */
export const ServerMutableClientMutableOptionalCreateDefault = <
  S extends Schema.Top,
>(
  schema: S,
  options: {
    readonly defaultValue: () => S["Encoded"] | null;
  }
): ServerMutableClientMutableOptionalCreateDefault<S> =>
  Field({
    select: Schema.OptionFromNullOr(schema),
    insert: Schema.OptionFromNullOr(schema),
    update: Schema.optionalKey(Schema.OptionFromNullOr(schema)),
    json: Schema.OptionFromNullOr(schema),
    jsonCreate: optionalKeyWithDecodingDefault({
      schema: Schema.OptionFromNullOr(schema),
      defaultValue: options.defaultValue,
    }),
    jsonUpdate: optionalNullableOptionKey(schema),
  });
