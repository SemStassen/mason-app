import { Option } from "effect";
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

export interface SystemImmutable<S extends Schema.Top>
	extends VariantSchema.Field<{
		readonly select: S;
		readonly json: S;
	}> {}

/**
 * Field owned entirely by the database. Never written by the server or
 * client — set via DEFAULT or triggers. Only readable.
 *
 * @example
 * createdAt: SystemImmutable(Timestamp)
 * updatedAt: SystemImmutable(Timestamp)
 */
export const SystemImmutable = <S extends Schema.Top>(
	schema: S,
): SystemImmutable<S> =>
	Field({
		select: schema,
		json: schema,
	});

export interface ServerManaged<S extends Schema.Top>
	extends VariantSchema.Field<{
		readonly select: S;
		readonly insert: S;
		readonly update: S;
		readonly json: S;
	}> {}

/**
 * Field managed entirely by the server. Never included in client-facing
 * create or update inputs. The server can set and mutate freely.
 *
 * @example
 * id: ServerManaged(WorkspaceId)
 * inviterId: ServerManaged(UserId)
 * activeWorkspaceId: ServerManaged(WorkspaceId)
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

export interface ClientOrServerManaged<S extends Schema.Top>
	extends VariantSchema.Field<{
		readonly select: S;
		readonly insert: S;
		readonly update: S;
		readonly json: S;
		readonly jsonCreate: Schema.OptionFromOptionalKey<S>;
	}> {}

/**
 * Field the client may optionally provide on create. If absent, the server
 * assigns a value. Never updatable by the client after creation.
 * Useful for local-first flows where the client generates its own IDs.
 *
 * @example
 * id: ClientOrServerManaged(WorkspaceId)
 */
export const ClientOrServerManaged = <S extends Schema.Top>(
	schema: S,
): ClientOrServerManaged<S> =>
	Field({
		select: schema,
		insert: schema,
		update: schema,
		json: schema,
		jsonCreate: Schema.OptionFromOptionalKey(schema),
	});

export interface CreateOnly<S extends Schema.Top>
	extends VariantSchema.Field<{
		readonly select: S;
		readonly insert: S;
		readonly update: S;
		readonly json: S;
		readonly jsonCreate: S;
	}> {}

/**
 * Field the client must provide on create and that is fixed forever after.
 * The server can still read and write internally, but it is never included
 * in client-facing update inputs.
 *
 * @example
 * email: CreateOnly(Email)
 * slug: CreateOnly(Schema.NonEmptyTrimmedString)
 */
export const CreateOnly = <S extends Schema.Top>(schema: S): CreateOnly<S> =>
	Field({
		select: schema,
		insert: schema,
		update: schema,
		json: schema,
		jsonCreate: schema,
	});

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

export interface OptionalMutableOption<S extends Schema.Top>
	extends VariantSchema.Field<{
		readonly select: Schema.Option<S>;
		readonly insert: Schema.Option<S>;
		readonly update: Schema.Option<S>;
		readonly json: Schema.Option<S>;
		readonly jsonCreate: Schema.optionalKey<Schema.Option<S>>;
		readonly jsonUpdate: Schema.optionalKey<Schema.Option<S>>;
	}> {}

/**
 * Optional field the client can freely mutate. Bakes in Option<T> on all
 * internal variants — pass the inner schema, not the wrapped one.
 * Absent in jsonCreate means not provided, absent in jsonUpdate means
 * "leave unchanged".
 *
 * @example
 * logoUrl: OptionalMutableOption(Schema.NonEmptyTrimmedString)
 * metadata: OptionalMutableOption(Schema.Json)
 */
export const OptionalMutableOption = <S extends Schema.Top>(
	schema: S,
): OptionalMutableOption<S> =>
	Field({
		select: Schema.Option(schema),
		insert: Schema.Option(schema),
		update: Schema.Option(schema),
		json: Schema.Option(schema),
		jsonCreate: Schema.optionalKey(Schema.Option(schema)),
		jsonUpdate: Schema.optionalKey(Schema.Option(schema)),
	});

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
