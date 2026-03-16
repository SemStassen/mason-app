import { VariantSchema } from "effect/unstable/schema";
// biome-ignore lint/performance/noNamespaceImport: Needed to avoid circular dependency
import * as Schema from "./Schema";

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

// ---------------------------------------------------------------------------
// SystemGenerated
// ---------------------------------------------------------------------------

export interface SystemGenerated<S extends Schema.Top>
  extends VariantSchema.Field<{
    readonly select: S;
    readonly json: S;
  }> {}

/**
 * Field owned entirely by the database. Set via DEFAULT, serial, or triggers.
 * Never written by the server or client — only readable.
 *
 * Absent from all insert, update, and JSON input variants.
 *
 * Local-first: client treats this as read-only; never included in any
 * mutation payload.
 *
 * @example
 * createdAt: SystemGenerated(Timestamp)
 * rowVersion: SystemGenerated(Schema.Number)
 */
export const SystemGenerated = <S extends Schema.Top>(
  schema: S
): SystemGenerated<S> =>
  Field({
    select: schema,
    json: schema,
  });

// ---------------------------------------------------------------------------
// ServerImmutable
// ---------------------------------------------------------------------------

export interface ServerImmutable<S extends Schema.Top>
  extends VariantSchema.Field<{
    readonly select: S;
    readonly insert: S;
    readonly json: S;
  }> {}

/**
 * Field set once by the server and never updated. The value is permanent
 * after the initial insert — no SQL UPDATE will ever touch this column.
 *
 * Absent from the update variant and all JSON input variants — never included
 * in create or update payloads from any source.
 *
 * Local-first: client treats this as read-only after the initial sync.
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
// ServerManaged
// ---------------------------------------------------------------------------

export interface ServerManaged<S extends Schema.Top>
  extends VariantSchema.Field<{
    readonly select: S;
    readonly insert: S;
    readonly update: Schema.optionalKey<S>;
    readonly json: S;
  }> {}

/**
 * Non-nullable field managed entirely by the server. Never included in
 * client-facing create or update payloads. The server can read and write
 * freely.
 *
 * Uses patch semantics on update — the server only writes this column when
 * explicitly provided.
 *
 * Local-first: server is always authoritative on these fields. The client's
 * local copy is stale until a confirmed server response is received.
 *
 * For nullable server-managed fields (DB NULL), use ServerManagedNullable.
 *
 * @example
 * emailVerified: ServerManaged(Schema.Boolean)
 * role: ServerManaged(WorkspaceRole)
 * status: ServerManaged(Schema.Literals(["pending", "accepted"]))
 */
export const ServerManaged = <S extends Schema.Top>(
  schema: S
): ServerManaged<S> =>
  Field({
    select: schema,
    insert: schema,
    update: Schema.optionalKey(schema),
    json: schema,
  });

// ---------------------------------------------------------------------------
// ServerManagedNullable
// ---------------------------------------------------------------------------

export interface ServerManagedNullable<S extends Schema.Top>
  extends VariantSchema.Field<{
    readonly select: Schema.OptionFromNullOr<S>;
    readonly insert: Schema.OptionFromNullOr<S>;
    readonly update: Schema.optionalKey<Schema.OptionFromNullOr<S>>;
    readonly json: Schema.Option<S>;
  }> {}

/**
 * Nullable field managed entirely by the server. DB variants use
 * OptionFromNullOr so that SQL NULLs decode correctly to None. The JSON
 * read variant uses Option<T> for idiomatic client access.
 *
 * Never included in client-facing create or update payloads. The server
 * can read and write freely via the insert and update variants.
 *
 * Pass the inner schema — the Option wrapping is applied automatically.
 * Uses patch semantics on update — the server only writes this column when
 * explicitly provided.
 *
 * Local-first: server is always authoritative on these fields.
 *
 * @example
 * archivedAt: ServerManagedNullable(Schema.DateTimeUtcFromDate)
 * deletedAt: ServerManagedNullable(Schema.DateTimeUtcFromDate)
 * activeWorkspaceId: ServerManagedNullable(WorkspaceId)
 */
export const ServerManagedNullable = <S extends Schema.Top>(
  schema: S
): ServerManagedNullable<S> =>
  Field({
    select: Schema.OptionFromNullOr(schema),
    insert: Schema.OptionFromNullOr(schema),
    update: Schema.optionalKey(Schema.OptionFromNullOr(schema)),
    json: Schema.Option(schema),
  });

// ---------------------------------------------------------------------------
// ServerPrivate
// ---------------------------------------------------------------------------

export interface ServerPrivate<S extends Schema.Top>
  extends VariantSchema.Field<{
    readonly select: S;
    readonly insert: S;
    readonly update: Schema.optionalKey<S>;
  }> {}

/**
 * Field the server manages internally that is never serialized to the client.
 * Absent from all JSON variants — will never appear in API responses or inputs.
 *
 * Uses patch semantics on update — the server only writes this column when
 * explicitly provided.
 *
 * @example
 * passwordHash: ServerPrivate(Schema.NonEmptyTrimmedString)
 * totpSecret: ServerPrivate(Schema.NonEmptyTrimmedString)
 */
export const ServerPrivate = <S extends Schema.Top>(
  schema: S
): ServerPrivate<S> =>
  Field({
    select: schema,
    insert: schema,
    update: Schema.optionalKey(schema),
  });

// ---------------------------------------------------------------------------
// ClientGenerated
// ---------------------------------------------------------------------------

export interface ClientGenerated<S extends Schema.Top>
  extends VariantSchema.Field<{
    readonly select: S;
    readonly insert: S;
    readonly json: S;
    readonly jsonCreate: Schema.OptionFromOptionalKey<S>;
  }> {}

/**
 * Primary key for local-first entities. The client may optionally provide
 * this value on create — if absent, the server generates one.
 *
 * Truly immutable after creation: absent from all update variants. Unlike
 * ClientOptionalImmutable, there is no server-side update escape hatch.
 *
 * Local-first: the client mutation layer MUST always generate and provide
 * the ID before writing to the local DB, so the optimistic row has a stable
 * primary key. API callers that don't need local-first can omit it.
 *
 * @example
 * id: ClientGenerated(ProjectId)
 * id: ClientGenerated(TimeEntryId)
 */
export const ClientGenerated = <S extends Schema.Top>(
  schema: S
): ClientGenerated<S> =>
  Field({
    select: schema,
    insert: schema,
    json: schema,
    jsonCreate: Schema.OptionFromOptionalKey(schema),
  });

// ---------------------------------------------------------------------------
// ClientImmutable
// ---------------------------------------------------------------------------

export interface ClientImmutable<S extends Schema.Top>
  extends VariantSchema.Field<{
    readonly select: S;
    readonly insert: S;
    readonly json: S;
    readonly jsonCreate: S;
  }> {}

/**
 * Field the client must provide on create and that is truly immutable after
 * that — absent from all update variants with no server escape hatch.
 *
 * Distinct from ClientRequiredImmutable, which includes a server-side
 * update variant for internal corrections. Use ClientImmutable when the
 * column must never change after insert under any circumstances.
 *
 * @example
 * provider: ClientImmutable(WorkspaceIntegrationProvider)
 */
export const ClientImmutable = <S extends Schema.Top>(
  schema: S
): ClientImmutable<S> =>
  Field({
    select: schema,
    insert: schema,
    json: schema,
    jsonCreate: schema,
  });

// ---------------------------------------------------------------------------
// ClientRequiredImmutable
// ---------------------------------------------------------------------------

export interface ClientRequiredImmutable<S extends Schema.Top>
  extends VariantSchema.Field<{
    readonly select: S;
    readonly insert: S;
    readonly update: Schema.optionalKey<S>;
    readonly json: S;
    readonly jsonCreate: S;
  }> {}

/**
 * Field the client must provide on create. Fixed from the client's
 * perspective forever after — absent from jsonUpdate. The server retains an
 * internal update escape hatch via the update variant.
 *
 * "Immutable" here means immutable from the client's perspective: the client
 * cannot update this field after creation. The server can still write it
 * internally when explicitly needed.
 *
 * Uses patch semantics on update — the server only writes this column when
 * explicitly provided.
 *
 * Local-first: client owns the initial value and can write it optimistically
 * on create. Treat as immutable after that.
 *
 * @example
 * email: ClientRequiredImmutable(Email)
 * slug: ClientRequiredImmutable(Schema.NonEmptyTrimmedString)
 */
export const ClientRequiredImmutable = <S extends Schema.Top>(
  schema: S
): ClientRequiredImmutable<S> =>
  Field({
    select: schema,
    insert: schema,
    update: Schema.optionalKey(schema),
    json: schema,
    jsonCreate: schema,
  });

// ---------------------------------------------------------------------------
// ClientOptionalImmutable
// ---------------------------------------------------------------------------

export interface ClientOptionalImmutable<S extends Schema.Top>
  extends VariantSchema.Field<{
    readonly select: S;
    readonly insert: S;
    readonly update: Schema.optionalKey<S>;
    readonly json: S;
    readonly jsonCreate: Schema.OptionFromOptionalKey<S>;
  }> {}

/**
 * Field the client may optionally provide on create. If absent, the server
 * assigns a value. Fixed from the client's perspective forever after —
 * absent from jsonUpdate. The server retains an internal update escape hatch
 * via the update variant.
 *
 * "Immutable" here means immutable from the client's perspective: the client
 * cannot update this field after creation. The server can still write it
 * internally when explicitly needed.
 *
 * Uses patch semantics on update — the server only writes this column when
 * explicitly provided.
 *
 * For local-first primary keys where the ID must be truly immutable after
 * creation (no server update escape hatch), use ClientGenerated instead.
 *
 * @example
 * externalId: ClientOptionalImmutable(ExternalId)
 */
export const ClientOptionalImmutable = <S extends Schema.Top>(
  schema: S
): ClientOptionalImmutable<S> =>
  Field({
    select: schema,
    insert: schema,
    update: Schema.optionalKey(schema),
    json: schema,
    jsonCreate: Schema.OptionFromOptionalKey(schema),
  });

// ---------------------------------------------------------------------------
// ClientMutable
// ---------------------------------------------------------------------------

export interface ClientMutable<S extends Schema.Top>
  extends VariantSchema.Field<{
    readonly select: S;
    readonly insert: S;
    readonly update: Schema.optionalKey<S>;
    readonly json: S;
    readonly jsonCreate: S;
    readonly jsonUpdate: Schema.optionalKey<S>;
  }> {}

/**
 * Required non-nullable field the client must provide on create and can
 * update freely.
 *
 * Uses patch semantics on both the server update variant and jsonUpdate —
 * absent means "leave unchanged".
 *
 * Local-first: fully optimistic. The client owns this value and can apply
 * mutations locally before syncing.
 *
 * @example
 * name: ClientMutable(Schema.NonEmptyTrimmedString)
 * role: ClientMutable(WorkspaceRole)
 */
export const ClientMutable = <S extends Schema.Top>(
  schema: S
): ClientMutable<S> =>
  Field({
    select: schema,
    insert: schema,
    update: Schema.optionalKey(schema),
    json: schema,
    jsonCreate: schema,
    jsonUpdate: Schema.optionalKey(schema),
  });

// ---------------------------------------------------------------------------
// ClientMutableWithDefault
// ---------------------------------------------------------------------------

export interface ClientMutableWithDefault<S extends Schema.Top>
  extends VariantSchema.Field<{
    readonly select: S;
    readonly insert: S;
    readonly update: Schema.optionalKey<S>;
    readonly json: S;
    readonly jsonCreate: Schema.optionalKey<S>;
    readonly jsonUpdate: Schema.optionalKey<S>;
  }> {}

/**
 * Non-nullable mutable field that has a database DEFAULT. The client may
 * optionally provide this value on create — if absent, the DB DEFAULT is
 * used. The client can update it freely after creation.
 *
 * Distinct from ClientMutable (where jsonCreate is required) and
 * ClientMutableOptional (where the field is nullable). Here the field is
 * always non-null in the DB but the client doesn't have to supply a value
 * at creation time.
 *
 * Uses patch semantics on both the server update variant and jsonUpdate —
 * absent means "leave unchanged".
 *
 * Local-first: the local DB must also define a DEFAULT for this column so
 * that optimistic inserts without the value succeed.
 *
 * @example
 * hexColor: ClientMutableWithDefault(HexColor)   // DB DEFAULT '#000000'
 * isBillable: ClientMutableWithDefault(Schema.Boolean)  // DB DEFAULT false
 * startedAt: ClientMutableWithDefault(Schema.DateTimeUtcFromDate)  // DB DEFAULT now()
 */
export const ClientMutableWithDefault = <S extends Schema.Top>(
  schema: S
): ClientMutableWithDefault<S> =>
  Field({
    select: schema,
    insert: schema,
    update: Schema.optionalKey(schema),
    json: schema,
    jsonCreate: Schema.optionalKey(schema),
    jsonUpdate: Schema.optionalKey(schema),
  });

// ---------------------------------------------------------------------------
// ClientMutableOptional
// ---------------------------------------------------------------------------

export interface ClientMutableOptional<S extends Schema.Top>
  extends VariantSchema.Field<{
    readonly select: Schema.OptionFromNullOr<S>;
    readonly insert: Schema.OptionFromNullOr<S>;
    readonly update: Schema.optionalKey<Schema.OptionFromNullOr<S>>;
    readonly json: Schema.Option<S>;
    readonly jsonCreate: Schema.optionalKey<Schema.Option<S>>;
    readonly jsonUpdate: Schema.optionalKey<Schema.Option<S>>;
  }> {}

/**
 * Nullable optional field the client can freely mutate. DB variants use
 * OptionFromNullOr so that SQL NULLs decode correctly to None. JSON variants
 * use Option<T> so the client works with idiomatic Option values.
 *
 * Pass the inner schema — the Option wrapping is applied automatically.
 * Uses patch semantics everywhere — absent in any mutation variant means
 * "leave unchanged".
 *
 * Local-first: fully optimistic. The client can set, clear, or leave
 * unchanged on any mutation.
 *
 * @example
 * logoUrl: ClientMutableOptional(Schema.NonEmptyTrimmedString)
 * metadata: ClientMutableOptional(Schema.Json)
 */
export const ClientMutableOptional = <S extends Schema.Top>(
  schema: S
): ClientMutableOptional<S> =>
  Field({
    select: Schema.OptionFromNullOr(schema),
    insert: Schema.OptionFromNullOr(schema),
    update: Schema.optionalKey(Schema.OptionFromNullOr(schema)),
    json: Schema.Option(schema),
    jsonCreate: Schema.optionalKey(Schema.Option(schema)),
    jsonUpdate: Schema.optionalKey(Schema.Option(schema)),
  });

// ---------------------------------------------------------------------------
// ClientTransformedMutable
// ---------------------------------------------------------------------------

export interface ClientTransformedMutable<
  Db extends Schema.Top,
  Json extends Schema.Top,
> extends VariantSchema.Field<{
    readonly select: Db;
    readonly insert: Db;
    readonly update: Schema.optionalKey<Db>;
    readonly json: Json;
    readonly jsonCreate: Json;
    readonly jsonUpdate: Schema.optionalKey<Json>;
  }> {}

/**
 * Client-owned mutable field stored in a different encoding in the DB vs
 * JSON. Useful for fields that are transformed before persistence (e.g.
 * hashed, encrypted, or serialized).
 *
 * Pass `{ db: dbSchema, json: jsonSchema }` — DB variants use `db`,
 * JSON read, create, and update use `json`. Uses patch semantics on both
 * the server update variant and jsonUpdate — absent means "leave unchanged".
 *
 * @example
 * apiKey: ClientTransformedMutable({ db: HashedString, json: Schema.NonEmptyTrimmedString })
 * config: ClientTransformedMutable({ db: Schema.parseJson(ConfigSchema), json: ConfigSchema })
 */
export const ClientTransformedMutable = <
  Db extends Schema.Top,
  Json extends Schema.Top,
>(schemas: {
  readonly db: Db;
  readonly json: Json;
}): ClientTransformedMutable<Db, Json> =>
  Field({
    select: schemas.db,
    insert: schemas.db,
    update: Schema.optionalKey(schemas.db),
    json: schemas.json,
    jsonCreate: schemas.json,
    jsonUpdate: Schema.optionalKey(schemas.json),
  });

// ---------------------------------------------------------------------------
// ClientTransformedImmutable
// ---------------------------------------------------------------------------

export interface ClientTransformedImmutable<
  Db extends Schema.Top,
  Json extends Schema.Top,
> extends VariantSchema.Field<{
    readonly select: Db;
    readonly insert: Db;
    readonly json: Json;
    readonly jsonCreate: Json;
  }> {}

/**
 * Client-owned field that must be provided on create, fixed from the
 * client's perspective forever after, but stored in a different encoding
 * in the DB vs JSON. The server can still write this column internally via
 * the update variant.
 *
 * Pass `{ db: dbSchema, json: jsonSchema }` — DB variants use `db`,
 * JSON read and create use `json`. Absent from jsonUpdate (client-immutable).
 * Uses patch semantics on update — the server only writes this column when
 * explicitly provided.
 *
 * @example
 * accessToken: ClientTransformedImmutable({ db: EncryptedString, json: Schema.NonEmptyTrimmedString })
 * config: ClientTransformedImmutable({ db: Schema.parseJson(ConfigSchema), json: ConfigSchema })
 */
export const ClientTransformedImmutable = <
  Db extends Schema.Top,
  Json extends Schema.Top,
>(schemas: {
  readonly db: Db;
  readonly json: Json;
}): ClientTransformedImmutable<Db, Json> =>
  Field({
    select: schemas.db,
    insert: schemas.db,
    json: schemas.json,
    jsonCreate: schemas.json,
  });
