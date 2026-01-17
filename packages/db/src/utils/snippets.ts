import { sql } from "drizzle-orm";
import { timestamp, uuid } from "drizzle-orm/pg-core";

export const tableId = uuid("id").primaryKey().default(sql`uuidv7()`);

export const tableMetadata = {
  createdAt: timestamp("created_at", {
    withTimezone: true,
    precision: 0,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    precision: 0,
  })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const tableArchive = {
  archivedAt: timestamp("archived_at", {
    withTimezone: true,
    precision: 0,
  }),
};

export const tableSoftDelete = {
  deletedAt: timestamp("deleted_at", {
    withTimezone: true,
    precision: 0,
  }),
};
