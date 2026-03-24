import { timestamp, uuid } from "drizzle-orm/pg-core";

export const tableId = uuid("id").primaryKey();

export const tableMetadata = {
  createdAt: timestamp("created_at", {
    withTimezone: true,
    precision: 0,
  }).notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    precision: 0,
  }).notNull(),
};

export const tableArchive = {
  archivedAt: timestamp("archived_at", {
    withTimezone: true,
    precision: 0,
  }),
};
