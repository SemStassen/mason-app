import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { tableId, tableMetadata, tableSoftDelete } from "../utils";
import { usersTable } from "./identity.schema";
import { timeEntriesTable } from "./time.schema";
import { workspacesTable } from "./workspace.schema";
import { workspaceInvitationsTable } from "./workspace-invitation.schema";

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
export const membersRelations = relations(membersTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [membersTable.userId],
    references: [usersTable.id],
  }),
  workspace: one(workspacesTable, {
    fields: [membersTable.workspaceId],
    references: [workspacesTable.id],
  }),
  sentWorkspaceInvitations: many(workspaceInvitationsTable),
  timeEntries: many(timeEntriesTable),
}));
