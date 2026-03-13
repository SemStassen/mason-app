import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { tableId, tableMetadata } from "../utils";
import { workspacesTable } from "./workspace.schema";
import { workspaceMembersTable } from "./workspace-member.schema";

export const workspaceInvitationsTable = pgTable("workspace_invitations", {
  id: tableId,
  // References
  inviterId: uuid("inviter_id")
    .references(() => workspaceMembersTable.id, { onDelete: "cascade" })
    .notNull(),
  workspaceId: uuid("workspace_id")
    .references(() => workspacesTable.id, { onDelete: "cascade" })
    .notNull(),
  // General
  email: varchar("email").notNull(),
  role: varchar("role").notNull(),
  status: varchar("status").notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    precision: 0,
  }).notNull(),
  // Metadata
  ...tableMetadata,
});
