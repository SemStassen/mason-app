import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { tableId, tableMetadata } from "../utils";
import { usersTable } from "./identity.schema";
import { membersTable } from "./member.schema";
import { workspacesTable } from "./workspace.schema";

export const workspaceInvitationsTable = pgTable("workspace_invitations", {
  id: tableId,
  // References
  inviterId: uuid("inviter_id")
    .references(() => membersTable.id, { onDelete: "cascade" })
    .notNull(),
  workspaceId: uuid("workspace_id")
    .references(() => workspacesTable.id, { onDelete: "cascade" })
    .notNull(),
  // General
  email: varchar("email").notNull(),
  role: varchar("role").$type<WorkspaceRole>().notNull(),
  status: varchar("status").$type<WorkspaceInvitationStatus>().notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    precision: 0,
  }).notNull(),
  // Metadata
  ...tableMetadata,
});
export const invitationsRelations = relations(
  workspaceInvitationsTable,
  ({ one }) => ({
    inviter: one(usersTable, {
      fields: [workspaceInvitationsTable.inviterId],
      references: [usersTable.id],
    }),
    workspace: one(workspacesTable, {
      fields: [workspaceInvitationsTable.workspaceId],
      references: [workspacesTable.id],
    }),
  })
);
