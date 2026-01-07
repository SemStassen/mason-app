import { relations } from "drizzle-orm";
import { pgTable, varchar } from "drizzle-orm/pg-core";
import { workspaceIntegrationsTable } from "~/domains/integration/db/schema";
import { membersTable } from "~/domains/member/db/schema";
import { projectsTable } from "~/domains/project/db/schema";
import { workspaceInvitationsTable } from "~/domains/workspace-invitation/db/schema";
import { tableId, tableMetadata } from "~/shared/db/snippets";

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
