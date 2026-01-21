import { relations } from "drizzle-orm";
import { jsonb, pgTable, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { tableId, tableMetadata } from "../utils";
import { membersTable } from "./member.schema";
import { projectsTable, tasksTable } from "./project.schema";
import { workspacesTable } from "./workspace.schema";

export const workspaceIntegrationsTable = pgTable(
  "workspace_integrations",
  {
    id: tableId,
    // References
    workspaceId: uuid("workspace_id")
      .references(() => workspacesTable.id, { onDelete: "cascade" })
      .notNull(),
    createdByMemberId: uuid("created_by_member_id").references(
      () => membersTable.id,
      { onDelete: "set null" }
    ),
    // General
    provider: varchar().notNull(),
    encryptedApiKey: varchar("encrypted_api_key").notNull(),
    // Metadata
    _metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...tableMetadata,
  },
  (table) => [
    unique("unique_workspace_id_provider").on(
      table.workspaceId,
      table.provider
    ),
  ]
);
export const workspaceIntegrationsRelations = relations(
  workspaceIntegrationsTable,
  ({ one }) => ({
    workspace: one(workspacesTable, {
      fields: [workspaceIntegrationsTable.workspaceId],
      references: [workspacesTable.id],
    }),
    createdByMember: one(membersTable, {
      fields: [workspaceIntegrationsTable.createdByMemberId],
      references: [membersTable.id],
    }),
  })
);

export const projectIntegrationsTable = pgTable("project_integrations", {
  id: tableId,
  // References
  workspaceId: uuid("workspace_id")
    .references(() => workspacesTable.id, { onDelete: "cascade" })
    .notNull(),
  projectId: uuid("project_id")
    .references(() => projectsTable.id)
    .notNull(),
  // General
  source: varchar().notNull(),
  externalId: varchar("external_id").notNull(),
  ...tableMetadata,
});

export const projectIntegrationsRelations = relations(
  projectIntegrationsTable,
  ({ one }) => ({
    workspace: one(workspacesTable, {
      fields: [projectIntegrationsTable.workspaceId],
      references: [workspacesTable.id],
    }),
    project: one(projectsTable, {
      fields: [projectIntegrationsTable.projectId],
      references: [projectsTable.id],
    }),
  })
);

export const taskIntegrationsTable = pgTable("task_integrations", {
  id: tableId,
  // References
  workspaceId: uuid("workspace_id")
    .references(() => workspacesTable.id, { onDelete: "cascade" })
    .notNull(),
  taskId: uuid("task_id")
    .references(() => tasksTable.id)
    .notNull(),
  // General
  source: varchar().notNull(),
  externalId: varchar("external_id").notNull(),
  ...tableMetadata,
});

export const taskIntegrationsRelations = relations(
  taskIntegrationsTable,
  ({ one }) => ({
    workspace: one(workspacesTable, {
      fields: [taskIntegrationsTable.workspaceId],
      references: [workspacesTable.id],
    }),
    task: one(tasksTable, {
      fields: [taskIntegrationsTable.taskId],
      references: [tasksTable.id],
    }),
  })
);
