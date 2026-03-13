import { VariantSchema } from "effect/unstable/schema";
import { Schema } from ".";

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
 * Never written by the server or client. Only readable.
 *
 * Local-first: client treats this as read-only; never included in any
 * mutation payload.
 *
 * @example
 * createdAt: SystemGenerated(Timestamp)
 * rowVersion: SystemGenerated(Schema.Number)
 */
export const SystemGenerated = <S extends Schema.Top>(
	schema: S,
): SystemGenerated<S> =>
	Field({
		select: schema,
		json: schema,
	});

// ---------------------------------------------------------------------------
// ServerManaged
// ---------------------------------------------------------------------------

export interface ServerManaged<S extends Schema.Top>
	extends VariantSchema.Field<{
		readonly select: S;
		readonly insert: S;
		readonly update: S;
		readonly json: S;
	}> {}

/**
 * Field managed entirely by the server. Never included in client-facing
 * create or update payloads. The server can read and write freely.
 *
 * Local-first: server is always authoritative on these fields. The client's
 * local copy is stale until a confirmed server response is received.
 *
 * @example
 * id: ServerManaged(WorkspaceId)
 * userId: ServerManaged(UserId)
 * emailVerified: ServerManaged(Schema.Boolean)
 * role: ServerManaged(WorkspaceRole)
 */
export const ServerManaged = <S extends Schema.Top>(
	schema: S,
): ServerManaged<S> =>
	Field({
		select: schema,
		insert: schema,
		update: schema,
		json: schema,
	});

// ---------------------------------------------------------------------------
// ClientProvided
// ---------------------------------------------------------------------------

export interface ClientProvided<S extends Schema.Top>
	extends VariantSchema.Field<{
		readonly select: S;
		readonly insert: S;
		readonly update: S;
		readonly json: S;
		readonly jsonCreate: S;
	}> {}

/**
 * Field the client must provide on create. Fixed forever after — never
 * included in client-facing update payloads. The server can still read and
 * write internally.
 *
 * Local-first: client owns the initial value and can write it optimistically
 * on create. Treat as immutable after that.
 *
 * @example
 * email: ClientProvided(Email)
 * slug: ClientProvided(Schema.NonEmptyTrimmedString)
 */
export const ClientProvided = <S extends Schema.Top>(
	schema: S,
): ClientProvided<S> =>
	Field({
		select: schema,
		insert: schema,
		update: schema,
		json: schema,
		jsonCreate: schema,
	});

// ---------------------------------------------------------------------------
// ClientOptional
// ---------------------------------------------------------------------------

export interface ClientOptional<S extends Schema.Top>
	extends VariantSchema.Field<{
		readonly select: S;
		readonly insert: S;
		readonly update: S;
		readonly json: S;
		readonly jsonCreate: Schema.OptionFromOptionalKey<S>;
	}> {}

/**
 * Field the client may optionally provide on create. If absent, the server
 * assigns a value. Fixed forever after — never included in client-facing
 * update payloads.
 *
 * Useful for local-first flows where the client can generate its own IDs
 * offline, but the server will generate one if the client doesn't.
 *
 * @example
 * id: ClientOptional(WorkspaceId)
 */
export const ClientOptional = <S extends Schema.Top>(
	schema: S,
): ClientOptional<S> =>
	Field({
		select: schema,
		insert: schema,
		update: schema,
		json: schema,
		jsonCreate: Schema.OptionFromOptionalKey(schema),
	});

// ---------------------------------------------------------------------------
// Mutable
// ---------------------------------------------------------------------------

export interface Mutable<S extends Schema.Top>
	extends VariantSchema.Field<{
		readonly select: S;
		readonly insert: S;
		readonly update: S;
		readonly json: S;
		readonly jsonCreate: S;
		readonly jsonUpdate: Schema.optionalKey<S>;
	}> {}

/**
 * Required field the client must provide on create and can update freely.
 * Uses patch semantics on update — absent in jsonUpdate means "leave unchanged".
 *
 * Local-first: fully optimistic. The client owns this value and can apply
 * mutations locally before syncing.
 *
 * @example
 * name: Mutable(Schema.NonEmptyTrimmedString)
 * role: Mutable(WorkspaceRole)
 */
export const Mutable = <S extends Schema.Top>(schema: S): Mutable<S> =>
	Field({
		select: schema,
		insert: schema,
		update: schema,
		json: schema,
		jsonCreate: schema,
		jsonUpdate: Schema.optionalKey(schema),
	});

// ---------------------------------------------------------------------------
// MutableOptional
// ---------------------------------------------------------------------------

export interface MutableOptional<S extends Schema.Top>
	extends VariantSchema.Field<{
		readonly select: Schema.OptionFromNullOr<S>;
		readonly insert: Schema.OptionFromNullOr<S>;
		readonly update: Schema.OptionFromNullOr<S>;
		readonly json: Schema.Option<S>;
		readonly jsonCreate: Schema.optionalKey<Schema.Option<S>>;
		readonly jsonUpdate: Schema.optionalKey<Schema.Option<S>>;
	}> {}

/**
 * Optional field the client can freely mutate. DB variants use
 * OptionFromNullOr so that SQL NULLs decode correctly to None. JSON variants
 * use Option<T> so the client works with idiomatic Option values.
 *
 * Pass the inner schema — the Option wrapping is applied automatically.
 * Absent in jsonCreate means not provided; absent in jsonUpdate means
 * "leave unchanged".
 *
 * Local-first: fully optimistic. The client can set, clear, or leave
 * unchanged on any mutation.
 *
 * @example
 * logoUrl: MutableOptional(Schema.NonEmptyTrimmedString)
 * metadata: MutableOptional(Schema.Json)
 */
export const MutableOptional = <S extends Schema.Top>(
	schema: S,
): MutableOptional<S> =>
	Field({
		select: Schema.OptionFromNullOr(schema),
		insert: Schema.OptionFromNullOr(schema),
		update: Schema.OptionFromNullOr(schema),
		json: Schema.Option(schema),
		jsonCreate: Schema.optionalKey(Schema.Option(schema)),
		jsonUpdate: Schema.optionalKey(Schema.Option(schema)),
	});

// ---------------------------------------------------------------------------
// Sensitive
// ---------------------------------------------------------------------------

export interface Sensitive<S extends Schema.Top>
	extends VariantSchema.Field<{
		readonly select: S;
		readonly insert: S;
		readonly update: S;
	}> {}

/**
 * Field the server manages internally that is never serialized to the client.
 * Absent from all json variants — will never appear in API responses or inputs.
 *
 * @example
 * passwordHash: Sensitive(Schema.NonEmptyTrimmedString)
 * totpSecret: Sensitive(Schema.NonEmptyTrimmedString)
 */
export const Sensitive = <S extends Schema.Top>(schema: S): Sensitive<S> =>
	Field({
		select: schema,
		insert: schema,
		update: schema,
	});

// ---------------------------------------------------------------------------
// TransformedMutable
// ---------------------------------------------------------------------------

export interface TransformedMutable<
	Db extends Schema.Top,
	Json extends Schema.Top,
> extends VariantSchema.Field<{
		readonly select: Db;
		readonly insert: Db;
		readonly update: Db;
		readonly json: Json;
		readonly jsonCreate: Json;
		readonly jsonUpdate: Schema.optionalKey<Json>;
	}> {}

/**
 * Field the client must provide on create and can update freely, but stored
 * in a different encoding in the DB vs JSON. Useful for fields that are
 * transformed before persistence (e.g. hashed, encrypted, or serialized).
 *
 * Pass `{ db: dbSchema, json: jsonSchema }` — DB variants use `db`,
 * JSON read, create, and update use `json`. Optional in jsonUpdate.
 *
 * @example
 * apiKey: TransformedMutable({ db: HashedString, json: Schema.NonEmptyTrimmedString })
 * config: TransformedMutable({ db: Schema.parseJson(ConfigSchema), json: ConfigSchema })
 */
export const TransformedMutable = <
	Db extends Schema.Top,
	Json extends Schema.Top,
>(schemas: {
	readonly db: Db;
	readonly json: Json;
}): TransformedMutable<Db, Json> =>
	Field({
		select: schemas.db,
		insert: schemas.db,
		update: schemas.db,
		json: schemas.json,
		jsonCreate: schemas.json,
		jsonUpdate: Schema.optionalKey(schemas.json),
	});

// ---------------------------------------------------------------------------
// TransformedImmutable
// ---------------------------------------------------------------------------

export interface TransformedImmutable<
	Db extends Schema.Top,
	Json extends Schema.Top,
> extends VariantSchema.Field<{
		readonly select: Db;
		readonly insert: Db;
		readonly update: Db;
		readonly json: Json;
		readonly jsonCreate: Json;
	}> {}

/**
 * Field the client must provide on create, fixed forever after, but stored
 * in a different encoding in the DB vs JSON. Useful for fields that are
 * transformed between representations (e.g. encrypted at rest, encoded,
 * or serialized differently).
 *
 * Pass `{ db: dbSchema, json: jsonSchema }` — DB variants use `db`,
 * JSON read and create use `json`. Absent from jsonUpdate (immutable).
 *
 * @example
 * accessToken: TransformedImmutable({ db: EncryptedString, json: Schema.NonEmptyTrimmedString })
 * config: TransformedImmutable({ db: Schema.parseJson(ConfigSchema), json: ConfigSchema })
 */
export const TransformedImmutable = <
	Db extends Schema.Top,
	Json extends Schema.Top,
>(schemas: {
	readonly db: Db;
	readonly json: Json;
}): TransformedImmutable<Db, Json> =>
	Field({
		select: schemas.db,
		insert: schemas.db,
		update: schemas.db,
		json: schemas.json,
		jsonCreate: schemas.json,
	});
