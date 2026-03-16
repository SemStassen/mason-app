import { sql } from "drizzle-orm";
import {
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { tableId, tableMetadata } from "../utils";
import { projectsTable, tasksTable } from "./project.schema";
import { workspacesTable } from "./workspace.schema";
import { workspaceMembersTable } from "./workspace-member.schema";

export const timeEntriesTable = pgTable(
  "time_entries",
  {
    id: tableId,
    // References
    workspaceId: uuid("workspace_id")
      .references(() => workspacesTable.id, { onDelete: "cascade" })
      .notNull(),
    workspaceMemberId: uuid("workspace_member_id")
      .references(() => workspaceMembersTable.id, { onDelete: "cascade" })
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
    notes: jsonb("notes"),
    // Metadata
    ...tableMetadata,
  },
  (table) => [
    uniqueIndex("time_entries_one_running_per_member_idx")
      .on(table.workspaceId, table.workspaceMemberId)
      .where(sql`${table.stoppedAt} is null`),
  ]
);
