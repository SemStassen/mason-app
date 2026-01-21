import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { tableId, tableMetadata, tableSoftDelete } from "../utils";
import { usersTable } from "./identity.schema";
import { workspacesTable } from "./workspace.schema";

export const membersTable = pgTable("members", {
  id: tableId,
  // References
  userId: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  workspaceId: uuid("workspace_id")
    .references(() => workspacesTable.id, { onDelete: "cascade" })
    .notNull(),
  // General
  role: varchar("role").notNull(),
  // Metadata
  ...tableSoftDelete,
  ...tableMetadata,
});
