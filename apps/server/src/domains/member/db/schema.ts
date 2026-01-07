import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { workspaceInvitationsTable } from "~/domains/workspace-invitation/db/schema";
import {
  timeEntriesTable,
  usersTable,
  workspacesTable,
} from "~/shared/db/schema";
import { tableId, tableMetadata, tableSoftDelete } from "~/shared/db/snippets";
import type { WorkspaceRole } from "~/shared/schemas";

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
  role: varchar("role").$type<WorkspaceRole>().notNull(),
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
