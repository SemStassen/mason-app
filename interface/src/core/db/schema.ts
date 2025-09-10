import { integer, pgTable, text, varchar } from 'drizzle-orm/pg-core';

export const snapshotsTable = pgTable('snapshots', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  timestamp: integer(),
  applicationName: varchar(),
  windowTitle: varchar(),
  idleTimeSeconds: integer(),
});

export const snapshotScreenshotsTable = pgTable('snapshot_screenshots', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  snapshotId: integer()
    .references(() => snapshotsTable.id, { onDelete: 'cascade' })
    .notNull(),
  displayIndex: integer().notNull(),
  relativePath: text().notNull(), // store path relative to AppLocalData
  width: integer(),
  height: integer(),
  byteSize: integer(),
  hash: varchar({ length: 64 }),
});
