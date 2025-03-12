import { type InferSelectModel, relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export type Organization = InferSelectModel<typeof organizationsTable>;
export const organizationsTable = pgTable("organizations", {
  uuid: uuid("uuid").primaryKey().defaultRandom(),
  // General
  name: varchar("name").notNull(),
});

export const workspacesTable = pgTable("workspaces", {
  uuid: uuid("uuid").primaryKey().defaultRandom(),
  // References
  organizationUuid: uuid("organization_uuid")
    .references(() => organizationsTable.uuid, {
      onDelete: "cascade",
    })
    .notNull(),
  // General
  name: varchar("name").notNull(),
});

export const workspaceRelations = relations(workspacesTable, ({ many }) => ({
  users: many(usersToWorkspacesTable),
}));

export type User = InferSelectModel<typeof usersTable>;
export const usersTable = pgTable("users", {
  uuid: uuid("uuid").primaryKey().defaultRandom(),
  // References
  organizationUuid: uuid("organization_uuid")
    .references(() => organizationsTable.uuid, {
      onDelete: "cascade",
    })
    .notNull(),
  // General
  name: varchar("name").notNull(),
  displayName: varchar("display_name").notNull(),
});

export const userRelations = relations(usersTable, ({ many }) => ({
  workspaces: many(usersToWorkspacesTable),
}));

export const timeEntriesTable = pgTable("time_entries", {
  uuid: uuid("uuid").primaryKey().defaultRandom(),
  // References
  userUuid: uuid("user_uuid")
    .notNull()
    .references(() => usersTable.uuid, { onDelete: "cascade" }),
  // General
  startedAt: timestamp("started_at", {
    withTimezone: true,
    precision: 0,
  }).notNull(),
  stoppedAt: timestamp("stopped_at", {
    withTimezone: true,
    precision: 0,
  }),
});

export const usersToWorkspacesTable = pgTable("users_to_workspaces", {
  userUuid: uuid("user_uuid")
    .notNull()
    .references(() => usersTable.uuid, { onDelete: "cascade" }),
  workspaceUuid: uuid("workspace_uuid")
    .notNull()
    .references(() => workspacesTable.uuid, { onDelete: "cascade" }),
});
