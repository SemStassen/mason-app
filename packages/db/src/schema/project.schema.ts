import {
  boolean,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { tableArchive, tableId, tableMetadata } from "../utils";
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
  ...tableArchive,
  ...tableMetadata,
});

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
  ...tableArchive,
  ...tableMetadata,
});
