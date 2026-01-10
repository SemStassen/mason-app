import { relations } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { tableId, tableMetadata, tableSoftDelete } from "../utils";
import {
  projectIntegrationsTable,
  taskIntegrationsTable,
} from "./integration.schema";
import { timeEntriesTable } from "./time.schema";
import { workspacesTable } from "./workspace.schema";

export const projectsTable = pgTable("projects", {
  id: tableId,
  // References
  workspaceId: uuid("workspace_id")
    .references(() => workspacesTable.id, { onDelete: "cascade" })
    .notNull(),
  // General
  name: varchar("name").notNull(),
  hexColor: varchar("hex_color").notNull(),
  isBillable: boolean("is_billable").default(true).notNull(),
  startDate: timestamp("start_date", {
    withTimezone: true,
    precision: 0,
  }),
  endDate: timestamp("end_date", {
    withTimezone: true,
    precision: 0,
  }),
  notes: jsonb("notes").$type<{
    // Generic object type
    [key: string]: unknown;
  }>(),
  // Metadata
  ...tableSoftDelete,
  ...tableMetadata,
});
export const projectsRelations = relations(projectsTable, ({ one, many }) => ({
  workspace: one(workspacesTable, {
    fields: [projectsTable.workspaceId],
    references: [workspacesTable.id],
  }),
  tasks: many(tasksTable),
  timeEntries: many(timeEntriesTable),
  integrations: many(projectIntegrationsTable),
}));

export const tasksTable = pgTable("tasks", {
  id: tableId,
  // References
  workspaceId: uuid("workspace_id")
    .references(() => workspacesTable.id, { onDelete: "cascade" })
    .notNull(),
  projectId: uuid("project_id")
    .references(() => projectsTable.id, { onDelete: "cascade" })
    .notNull(),
  // General
  name: varchar("name").notNull(),
  ...tableSoftDelete,
  ...tableMetadata,
});
export const tasksRelations = relations(tasksTable, ({ one, many }) => ({
  project: one(projectsTable, {
    fields: [tasksTable.projectId],
    references: [projectsTable.id],
  }),
  timeEntries: many(timeEntriesTable),
  integrations: many(taskIntegrationsTable),
}));
