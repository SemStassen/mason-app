import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  boolean,
  date,
  json,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const tableMetadata = {
  created_at: timestamp("created_at", {
    withTimezone: true,
    precision: 0,
  })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", {
    withTimezone: true,
    precision: 0,
  })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export type Workspace = InferSelectModel<typeof workspacesTable>;
export const workspacesTable = pgTable("workspaces", {
  uuid: uuid("uuid").primaryKey().defaultRandom(),
  // General
  name: varchar("name").notNull(),
  // Metadata
  ...tableMetadata,
});

export type User = InferSelectModel<typeof usersTable>;
export const usersTable = pgTable("users", {
  uuid: uuid("uuid").primaryKey().defaultRandom(),
  // References
  workspace_uuid: uuid("workspace_uuid")
    .references(() => workspacesTable.uuid, {
      onDelete: "cascade",
    })
    .notNull(),
  // General
  display_name: varchar("display_name").notNull(),
  email: varchar("email").notNull(),
  email_verified: boolean("email_verified").default(false).notNull(),
  image_url: varchar("image_url"),
  // Metadata
  ...tableMetadata,
});

export type InsertSession = InferInsertModel<typeof sessionsTable>;
export type Session = InferSelectModel<typeof sessionsTable>;
export const sessionsTable = pgTable("sessions", {
  uuid: uuid("uuid").primaryKey().defaultRandom(),
  // References
  user_uuid: uuid("user_uuid")
    .references(() => usersTable.uuid, { onDelete: "cascade" })
    .notNull(),
  // General
  session_token: varchar("session_token").notNull(),
  expires_at: date("expires_at").notNull(),
  ip_address: varchar("ip_address").notNull(),
  user_agent: varchar("user_agent").notNull(),
  // Metadata
  ...tableMetadata,
});

export const AccountsTable = pgTable("accounts", {
  uuid: uuid("uuid").primaryKey().defaultRandom(),
  // References
  user_uuid: uuid("user_uuid")
    .references(() => usersTable.uuid, { onDelete: "cascade" })
    .notNull(),
  // General
  account_id: varchar("account_id").notNull(),
  provider_id: varchar("provider_id").notNull(),
  access_token: varchar("access_token"),
  refresh_token: varchar("refresh_token"),
  access_token_expires_at: date("access_token_expires_at"),
  refresh_token_expires_at: date("refresh_token_expires_at"),
  scope: varchar("scope"),
  idToken: varchar("id_token"),
  password: varchar("password"),
  // Metadata
  ...tableMetadata,
});

export const VerificationsTable = pgTable("verifications", {
  uuid: uuid("uuid").primaryKey().defaultRandom(),
  // General
  identifier: varchar("identifier").notNull(),
  value: varchar("value").notNull(),
  expires_at: date("expires_at").notNull(),
  // Metadata
  ...tableMetadata,
});

export type InsertProject = InferInsertModel<typeof projectsTable>;
export type Project = InferSelectModel<typeof projectsTable>;
export const projectsTable = pgTable("projects", {
  uuid: uuid("uuid").primaryKey().defaultRandom(),
  // References
  workspace_uuid: uuid("workspace_uuid")
    .references(() => workspacesTable.uuid, { onDelete: "cascade" })
    .notNull(),
  creator_uuid: uuid("creator_uuid").references(() => usersTable.uuid, {
    onDelete: "set null",
  }),
  lead_uuid: uuid("lead_uuid").references(() => usersTable.uuid, {
    onDelete: "set null",
  }),
  // General
  name: varchar("name").notNull(),
  hex_color: varchar("hex_color").notNull(),
  is_billable: boolean("is_billable").default(true).notNull(),
  notes: json("notes").$type<{
    // Generic object type
    [key: string]: string;
  }>(),
  // Metadata
  ...tableMetadata,
});

export type InsertActivity = InferInsertModel<typeof activitiesTable>;
export type Activity = InferSelectModel<typeof activitiesTable>;
export const activitiesTable = pgTable("activities", {
  uuid: uuid("uuid").primaryKey().defaultRandom(),
  // References
  project_uuid: uuid("project_uuid")
    .references(() => projectsTable.uuid, { onDelete: "cascade" })
    .notNull(),
  // General
  name: varchar("name").notNull(),
  // Metadata
  ...tableMetadata,
});

export type TimeEntry = InferSelectModel<typeof timeEntriesTable>;
export const timeEntriesTable = pgTable("time_entries", {
  uuid: uuid("uuid").primaryKey().defaultRandom(),
  // References
  user_uuid: uuid("user_uuid")
    .references(() => usersTable.uuid, { onDelete: "cascade" })
    .notNull(),
  activity_uuid: uuid("activity_uuid")
    .references(() => activitiesTable.uuid, { onDelete: "cascade" })
    .notNull(),
  // General
  started_at: timestamp("started_at", {
    withTimezone: true,
    precision: 0,
  }).notNull(),
  stopped_at: timestamp("stopped_at", {
    withTimezone: true,
    precision: 0,
  }),
  // Metadata
  ...tableMetadata,
});
