import { VariantSchema } from "@effect/experimental";
import { Schema } from "effect";

const {
  Class,
  Field,
  FieldExcept,
  FieldOnly,
  Struct,
  Union,
  extract,
  fieldEvolve,
  fieldFromKey,
} = VariantSchema.make({
  variants: ["entity", "actionCreate", "actionPatch", "flowCreate", "flowPatch", "output"],
  defaultVariant: "entity",
});

export {
  Class,
  extract,
  Field,
  type fieldEvolve,
  FieldExcept,
  fieldFromKey,
  FieldOnly,
  Struct,
  Union,
};

/**
 * DomainManaged - Field managed by domain logic, not accessible via create/patch schemas
 * Not in any input (createInput, patchInput, create, patch), only in model and output
 * Can only be set by domain methods via _validate with full model type
 * Examples: id (generated), createdAt (generated), archivedAt (domain-managed), deletedAt (domain-managed), status (domain-managed)
 */
export const DomainManaged = <
  S extends Schema.Schema.All | Schema.PropertySignature.All,
>(
  schema: S
) =>
  Field({
    entity: schema,
    output: schema,
  });

/**
 * SystemImmutable - Set by system/actions from context, immutable after creation
 * In create (for internal use), NOT in createInput (added by flows from context)
 * Examples: workspaceId, createdByMemberId, userId (from auth/workspace context)
 */
export const SystemImmutable = <
  S extends Schema.Schema.All | Schema.PropertySignature.All,
>(
  schema: S
) =>
  Field({
    entity: schema,
    actionCreate: schema,
    output: schema,
  });

/**
 * UserImmutable - Set once by user on creation, never updated
 * In create and createInput, not in patch/patchInput
 * Examples: email, provider
 */
export const UserImmutable = <
  S extends Schema.Schema.All | Schema.PropertySignature.All,
>(
  schema: S
) =>
  Field({
    entity: schema,
    actionCreate: schema,
    flowCreate: schema,
    output: schema,
  });

/**
 * Mutable - Regular field that can be updated by user
 * In create/createInput (required), in patch/patchInput (optional)
 * Examples: displayName, description
 */
export const Mutable = <S extends Schema.Schema.All>(schema: S) =>
  Field({
    entity: schema,
    actionCreate: schema,
    actionPatch: Schema.optionalWith(schema, { exact: true }),
    flowCreate: schema,
    flowPatch: Schema.optionalWith(schema, { exact: true }),
    output: schema,
  });

/**
 * TransformedMutable - Field with different types for input vs storage, can be updated
 * Example: PlainApiKey (input) → EncryptedApiKey (storage)
 * In create/createInput/patch/patchInput with transformation
 */
export const TransformedMutable = <
  M extends Schema.Schema.All,
  I extends Schema.Schema.All,
>(
  modelSchema: M,
  inputSchema: I
) =>
  Field({
    entity: modelSchema,
    actionCreate: modelSchema,
    actionPatch: Schema.optionalWith(modelSchema, { exact: true }),
    flowCreate: inputSchema,
    flowPatch: Schema.optionalWith(inputSchema, { exact: true }),
    output: modelSchema,
  });

/**
 * TransformedImmutable - Immutable field with transformation
 * Set once on creation, transformed, never updated
 * Example: PlainApiKey (createInput) → EncryptedApiKey (model)
 */
export const TransformedImmutable = <
  M extends Schema.Schema.All | Schema.PropertySignature.All,
  I extends Schema.Schema.All | Schema.PropertySignature.All,
>(
  modelSchema: M,
  inputSchema: I
) =>
  Field({
    entity: modelSchema,
    actionCreate: modelSchema,
    flowCreate: inputSchema,
    output: modelSchema,
  });

/**
 * OptionalMutable - Field with default value, optional in create and createInput
 * Required in model (default applied), optional in patch/patchInput
 * Example: hexColor (default: "#000000"), isBillable (default: false)
 * Can also be used with Option schemas: OptionalMutable(Schema.OptionFromSelf(T))
 */
export const OptionalMutable = <S extends Schema.Schema.All>(schema: S) =>
  Field({
    entity: schema,
    actionCreate: Schema.optionalWith(schema, { exact: true }),
    actionPatch: Schema.optionalWith(schema, { exact: true }),
    flowCreate: Schema.optionalWith(schema, { exact: true }),
    flowPatch: Schema.optionalWith(schema, { exact: true }),
    output: schema,
  });
