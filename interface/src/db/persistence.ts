import type { WorkspaceId } from "@mason/core/shared/schemas";
import {
  createBrowserWASQLitePersistence,
  openBrowserWASQLiteOPFSDatabase,
} from "@tanstack/browser-db-sqlite-persistence";
import type { PersistedCollectionPersistence } from "@tanstack/browser-db-sqlite-persistence";

// Assigned during app bootstrap in `initDb` before React mounts.
// Safe to import statically — guaranteed to be initialized by the time any component renders.
// oxlint-disable-next-line no-mutable-exports
export let persistence: PersistedCollectionPersistence<object, string | number>;

export async function initDb(workspaceId: WorkspaceId) {
  const database = await openBrowserWASQLiteOPFSDatabase({
    databaseName: `mason-${workspaceId}.sqlite`,
  });
  persistence = createBrowserWASQLitePersistence({ database });
}
