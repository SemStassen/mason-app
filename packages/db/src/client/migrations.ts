import type { PGliteWorker } from "@electric-sql/pglite/worker";

import migration from "../../migrations/0000_overjoyed_tempest.sql?raw";

/**
 * This definitely needs to be made more robust
 * For example a schema-hash could be used to check for migrations
 * similar to how linear does it
 */
export const migrate = async (pg: PGliteWorker) => {
  const tables = await pg.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public'`,
  );

  if (tables.rows.length === 0) {
    await pg.exec(migration);
  }
};
