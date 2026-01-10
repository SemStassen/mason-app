import { relations } from "drizzle-orm";
import { pgTable, varchar } from "drizzle-orm/pg-core";
import { tableId, tableMetadata } from "../utils";
import { workspaceIntegrationsTable } from "./integration.schema";
import { membersTable } from "./member.schema";
import { projectsTable } from "./project.schema";
import { workspaceInvitationsTable } from "./workspace-invitation.schema";

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

export const workspacesRelations = relations(workspacesTable, ({ many }) => ({
  members: many(membersTable),
  workspaceInvitations: many(workspaceInvitationsTable),
  integrations: many(workspaceIntegrationsTable),
  projects: many(projectsTable),
}));
