import type { Schema as SchemaType } from "effect";
import { Schema } from "effect";

/**
 * Type-level check to ensure an RPC payload schema includes all fields from a core module DTO.
 * This provides compile-time safety to catch when RPC schemas are missing required DTO fields.
 *
 * The payload can have extra fields (like workspaceId from context), but must include all DTO fields.
 *
 * @example
 * ```typescript
 * import type { ProjectToCreateDTO } from "@mason/project";
 *
 * // This will error if CreateProjectRequest is missing fields from ProjectToCreateDTO
 * const _check: EnsureMatchesCoreDTO<
 *   typeof CreateProjectRequest,
 *   ProjectToCreateDTO
 * > = CreateProjectRequest;
 * ```
 */
export type EnsureMatchesCoreDTO<
  TPayloadSchema extends SchemaType.Schema.Any,
  TCoreDTO,
> = keyof TCoreDTO extends keyof SchemaType.Schema.Type<TPayloadSchema>
  ? TPayloadSchema
  : {
      error: "Payload schema is missing required fields from core DTO";
      missing: Exclude<
        keyof TCoreDTO,
        keyof SchemaType.Schema.Type<TPayloadSchema>
      >;
    };

/**
 * Type helper for ensuring schema alignment with DTOs.
 * Use with type annotation: `const schema: SchemaForDTO<typeof schema, DTO> = Schema.Struct({...})`
 *
 * @example
 * ```typescript
 * const _schema = Schema.Struct({...});
 * export const CreateProjectRequest: SchemaForDTO<typeof _schema, ProjectToCreateDTO> = _schema;
 * ```
 */
export type SchemaForDTO<
  TSchema extends SchemaType.Schema.Any,
  TCoreDTO,
> = keyof TCoreDTO extends keyof SchemaType.Schema.Type<TSchema>
  ? TSchema
  : {
      readonly error: "Schema Type must include all fields from DTO";
      readonly missing: Exclude<
        keyof TCoreDTO,
        keyof SchemaType.Schema.Type<TSchema>
      >;
    };

/**
 * Type-level check to ensure an RPC payload schema includes all required fields from a DTO.
 * This provides compile-time safety to catch missing fields.
 *
 * If the payload is missing required DTO fields, TypeScript will error.
 *
 * @example
 * ```typescript
 * // This will error if payload is missing required DTO fields
 * const payload: EnsureIncludesDTO<
 *   typeof MyPayloadSchema,
 *   typeof CreateProjectRequest
 * > = MyPayloadSchema;
 * ```
 */
export type EnsureIncludesDTO<
  TPayloadSchema extends SchemaType.Schema.Any,
  TDTOSchema extends SchemaType.Schema.Any,
> = SchemaType.Schema.Type<TDTOSchema> extends SchemaType.Schema.Type<TPayloadSchema>
  ? TPayloadSchema
  : {
      error: "Payload schema is missing required fields from DTO";
      missing: Exclude<
        keyof SchemaType.Schema.Type<TDTOSchema>,
        keyof SchemaType.Schema.Type<TPayloadSchema>
      >;
    };

/**
 * Creates an RPC payload schema that extends a DTO with additional fields.
 * This ensures all DTO fields are present while allowing additional context fields.
 *
 * The return type ensures type safety - if the DTO changes, this will error.
 *
 * @example
 * ```typescript
 * // Extend UpdateProjectRequest with workspaceId
 * Rpc.make("Update", {
 *   payload: extendDTO(UpdateProjectRequest, {
 *     workspaceId: WorkspaceId,
 *   }),
 *   success: ProjectResponse,
 * })
 * ```
 */
export function extendDTO<
  TDTOSchema extends SchemaType.Struct<SchemaType.Struct.Fields>,
  TAdditionalFields extends Record<string, SchemaType.Schema.Any>,
>(
  dto: TDTOSchema,
  additionalFields: TAdditionalFields
): Schema.Struct<TDTOSchema["fields"] & TAdditionalFields> {
  // TypeScript ensures dto is a Struct at compile time
  return Schema.Struct({
    ...dto.fields,
    ...additionalFields,
  });
}

/**
 * Helper to create a type-safe RPC payload that must match a core module DTO.
 * This ensures the RPC schema stays aligned with the core DTO interface.
 *
 * @example
 * ```typescript
 * import type { ProjectToCreateDTO } from "@mason/project";
 *
 * Rpc.make("Create", {
 *   payload: ensureMatchesCoreDTO(CreateProjectRequest, {} as ProjectToCreateDTO),
 *   success: ProjectResponse,
 * })
 * ```
 */
export function ensureMatchesCoreDTO<
  TPayloadSchema extends SchemaType.Schema.Any,
  TCoreDTO,
>(
  payload: TPayloadSchema,
  _coreDTO: TCoreDTO
): EnsureMatchesCoreDTO<TPayloadSchema, TCoreDTO> {
  return payload as never;
}

/**
 * Type-only helper to ensure RPC payload matches core DTO.
 * Use this as a type annotation to get compile-time errors.
 *
 * @example
 * ```typescript
 * import type { ProjectToCreateDTO } from "@mason/project";
 *
 * // This will error if CreateProjectRequest doesn't include all ProjectToCreateDTO fields
 * const payload = ensureMatchesCoreDTOType<typeof CreateProjectRequest, ProjectToCreateDTO>(
 *   CreateProjectRequest
 * );
 * ```
 */
export function ensureMatchesCoreDTOType<
  TPayloadSchema extends SchemaType.Schema.Any,
  TCoreDTO,
>(payload: TPayloadSchema): EnsureMatchesCoreDTO<TPayloadSchema, TCoreDTO> {
  return payload as never;
}
