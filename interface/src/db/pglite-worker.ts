import { PGlite } from "@electric-sql/pglite";
import { worker } from "@electric-sql/pglite/worker";
import { generateUUID } from "@mason/core/shared/utils";

import {
  deleteDatabase,
  deleteDatabaseEntry,
  findDatabaseEntry,
  listStaleDatabaseEntries,
  putDatabaseEntry,
} from "./registry";
import { SCHEMA_HASH } from "./schema-hash";
// @ts-expect-error - SQL import
import schemaSql from "./schema.sql?raw";

type WorkerMeta = {
  workspaceMemberId?: string;
};

function resolveWorkspaceMemberId(meta: unknown): string {
  if (typeof meta === "object" && meta !== null) {
    const value = (meta as WorkerMeta).workspaceMemberId;
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return "default";
}

function createDatabaseName(): string {
  return `mason_${generateUUID().replaceAll("-", "")}`;
}

// See: https://pglite.dev/docs/multi-tab-worker
worker({
  async init(options) {
    const workspaceMemberId = resolveWorkspaceMemberId(options.meta);
    const now = Date.now();

    const existingEntry = await findDatabaseEntry({
      workspaceMemberId,
      schemaHash: SCHEMA_HASH,
    });

    let activeEntry = existingEntry;
    let pg: PGlite;

    if (activeEntry) {
      pg = new PGlite({
        ...options,
        dataDir: `idb://${activeEntry.name}`,
      });
    } else {
      const name = createDatabaseName();

      pg = new PGlite({
        ...options,
        dataDir: `idb://${name}`,
      });

      await pg.exec(schemaSql);

      activeEntry = {
        name,
        workspaceMemberId,
        schemaHash: SCHEMA_HASH,
        createdAt: now,
      };

      await putDatabaseEntry(activeEntry);
    }

    const staleEntries = await listStaleDatabaseEntries({
      workspaceMemberId,
      schemaHash: SCHEMA_HASH,
    });

    await Promise.all(
      staleEntries
        .filter((entry) => entry.name !== activeEntry.name)
        .map(async (entry) => {
          await deleteDatabase(entry.name);
          await deleteDatabaseEntry(entry.name);
        })
    );

    return pg;
  },
});
