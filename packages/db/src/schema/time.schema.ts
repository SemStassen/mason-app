import { relations } from "drizzle-orm";
import { jsonb, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { tableId, tableMetadata } from "../utils";
import { membersTable } from "./member.schema";
import { projectsTable, tasksTable } from "./project.schema";
import { workspacesTable } from "./workspace.schema";

export const timeEntriesTable = pgTable("time_entries", {
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
  ...tableMetadata,
});
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
