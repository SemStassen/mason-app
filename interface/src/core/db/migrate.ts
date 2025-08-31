import type { PGlite } from '@electric-sql/pglite';
// @ts-expect-error - SQL import
import m1 from './migrations/0000_elite_ozymandias.sql?raw';

export async function migrate(pg: PGlite) {
  const tables = await pg.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public'`
  );
  if (tables.rows.length === 0) {
    await pg.exec(m1);
  }
}
