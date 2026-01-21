import { pgTable, varchar } from "drizzle-orm/pg-core";
import { tableId, tableMetadata } from "../utils";

export const workspacesTable = pgTable("workspaces", {
  id: tableId,
  // General
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull(),
  logoUrl: varchar("logo_url"),
  metadata: varchar("metadata"),
  // Metadata
  ...tableMetadata,
});
