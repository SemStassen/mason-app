import { sql } from "drizzle-orm";
import { pgPolicy, timestamp, uuid } from "drizzle-orm/pg-core";

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

export const tableSoftDelete = {
  deletedAt: timestamp("deleted_at", {
    withTimezone: true,
    precision: 0,
  }),
};

export function workspaceIsolationPolicy(tableName: string) {
  return pgPolicy(`${tableName}_workspace_isolation`, {
    as: "permissive",
    to: "public",
    for: "all",
    using: sql`${sql.identifier(tableName)}.workspace_id = current_setting('app.current_workspace_id')::uuid`,
    withCheck: sql`${sql.identifier(tableName)}.workspace_id = current_setting('app.current_workspace_id')::uuid`,
  });
}
