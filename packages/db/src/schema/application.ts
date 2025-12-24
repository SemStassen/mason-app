import { relations } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  tableId,
  tableMetadata,
  tableSoftDelete,
  workspaceIsolationPolicy,
} from "./../snippets";
import { membersTable, workspacesTable } from "./auth";

export const workspaceIntegrationsTable = pgTable(
  "workspace_integrations",
  {
    id: tableId,
    // References
    workspaceId: uuid("workspace_id")
      .references(() => workspacesTable.id, { onDelete: "cascade" })
      .notNull(),
    createdByMemberId: uuid("created_by_member_id")
      .references(() => membersTable.id, { onDelete: "cascade" })
      .notNull(),
    // General
    kind: varchar({ enum: ["float"] }).notNull(),
    encryptedApiKey: varchar("encrypted_api_key").notNull(),
    // Metadata
    _metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...tableMetadata,
  },
  (table) => [
    workspaceIsolationPolicy("workspace_integrations"),
    unique("unique_workspace_id_kind").on(table.workspaceId, table.kind),
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

export type DbWorkspaceIntegration =
  typeof workspaceIntegrationsTable.$inferSelect;

export const projectsTable = pgTable(
  "projects",
  {
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
    _metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...tableSoftDelete,
    ...tableMetadata,
  },
  () => [workspaceIsolationPolicy("projects")]
);
export const projectsRelations = relations(projectsTable, ({ one, many }) => ({
  workspace: one(workspacesTable, {
    fields: [projectsTable.workspaceId],
    references: [workspacesTable.id],
  }),
  tasks: many(tasksTable),
  timeEntries: many(timeEntriesTable),
}));

export type DbProject = typeof projectsTable.$inferSelect;

export const tasksTable = pgTable(
  "tasks",
  {
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
    // Metadata
    _metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...tableSoftDelete,
    ...tableMetadata,
  },
  () => [workspaceIsolationPolicy("tasks")]
);
export const tasksRelations = relations(tasksTable, ({ one, many }) => ({
  project: one(projectsTable, {
    fields: [tasksTable.projectId],
    references: [projectsTable.id],
  }),
  timeEntries: many(timeEntriesTable),
}));

export type DbTask = typeof tasksTable.$inferSelect;

export const timeEntriesTable = pgTable(
  "time_entries",
  {
    id: tableId,
    // References
    workspaceId: uuid("workspace_id")
      .references(() => workspacesTable.id, { onDelete: "cascade" })
      .notNull(),
    memberId: uuid("member_id")
      .references(() => membersTable.id, { onDelete: "cascade" })
      .notNull(),
    projectId: uuid("project_id")
      .references(() => projectsTable.id, { onDelete: "cascade" })
      .notNull(),
    taskId: uuid("task_id").references(() => tasksTable.id, {
      onDelete: "set null",
    }),
    // General
    startedAt: timestamp("started_at", {
      withTimezone: true,
      precision: 0,
    }).notNull(),
    stoppedAt: timestamp("stopped_at", {
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
  },
  () => [workspaceIsolationPolicy("time_entries")]
);
export const timeEntriesRelations = relations(timeEntriesTable, ({ one }) => ({
  member: one(membersTable, {
    fields: [timeEntriesTable.memberId],
    references: [membersTable.userId],
  }),
  project: one(projectsTable, {
    fields: [timeEntriesTable.projectId],
    references: [projectsTable.id],
  }),
  task: one(tasksTable, {
    fields: [timeEntriesTable.taskId],
    references: [tasksTable.id],
  }),
}));

export type DbTimeEntry = typeof timeEntriesTable.$inferSelect;
