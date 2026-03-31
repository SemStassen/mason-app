import type { PersistedCollectionPersistence } from "@tanstack/browser-db-sqlite-persistence";
import { persistedCollectionOptions } from "@tanstack/browser-db-sqlite-persistence";
import type {
  ElectricCollectionConfig,
  ElectricCollectionUtils,
} from "@tanstack/electric-db-collection";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import type { Collection, Row } from "@tanstack/react-db";
import { createCollection as createTanstackCollection } from "@tanstack/react-db";
type CreateCollectionOptions<TRow extends Row<unknown>, TSchema> = Omit<
  ElectricCollectionConfig<TRow, TSchema>,
  "schema"
> & {
  schema: TSchema;
  persistence: PersistedCollectionPersistence<TRow, string | number>;
  schemaVersion?: number;
};

/**
 * Temporary workaround for a TanStack typing issue when composing
 * `electricCollectionOptions`, `persistedCollectionOptions`, and
 * `createCollection`.
 *
 * The runtime composition is valid, but TypeScript loses the schema-aware
 * overload across that chain and falls back to the `schema?: never` branch.
 * That causes valid schema-backed collections to fail type-checking with
 * errors like "type ... is not assignable to undefined".
 *
 * We centralize the cast here so individual collection definitions keep
 * precise row/schema types without repeating the workaround everywhere.
 *
 * Remove this helper once the upstream overload/inference issue is fixed.
 */
export function createCollectionTemp<TRow extends Row<unknown>, TSchema>(
  options: CreateCollectionOptions<TRow, TSchema>
): Collection<TRow, string | number, ElectricCollectionUtils<TRow>, TSchema> {
  const { persistence, schemaVersion, ...electricOptions } = options;
  return createTanstackCollection(
    persistedCollectionOptions({
      persistence,
      schemaVersion,
      ...electricCollectionOptions({
        ...electricOptions,
      }),
    })
  ) as unknown as Collection<
    TRow,
    string | number,
    ElectricCollectionUtils<TRow>,
    TSchema
  >;
}
