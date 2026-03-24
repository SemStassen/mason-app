import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

import { tableId, tableMetadata } from "./utils/snippets";

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

export const workspaceMembersTable = pgTable("workspace_members", {
  id: tableId,
  // References
  userId: uuid("user_id").notNull(),
  workspaceId: uuid("workspace_id").notNull(),
  // General
  displayName: varchar("display_name").notNull(),
  role: varchar("role").notNull(),
  imageUrl: varchar("image_url"),
  // Metadata
  ...tableMetadata,
});
