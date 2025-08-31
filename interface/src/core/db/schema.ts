import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const snapshotsTable = pgTable('snapshots', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  timestamp: integer(),
  applicationName: varchar(),
  windowTitle: varchar(),
  idleTimeSeconds: integer(),
});
