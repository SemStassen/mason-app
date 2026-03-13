import { pgTable, text } from "drizzle-orm/pg-core";
import { tableId, tableMetadata } from "../utils";


export const workspacesTable = pgTable("workspaces", {
  id: tableId,
  // General
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  logoUrl: text("logo_url"),
  metadata: text("metadata"),
  // Metadata
  ...tableMetadata,
});

