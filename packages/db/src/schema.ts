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

export type User = InferSelectModel<typeof usersTable>;
export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  // General
  display_name: varchar("display_name").notNull(),
  email: varchar("email").notNull(),
  email_verified: boolean("email_verified").default(false).notNull(),
  image_url: varchar("image_url"),
  // Metadata
  ...tableMetadata,
});

export const sessionsTable = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  // References
  user_id: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  // General
  session_token: varchar("session_token").notNull(),
  expires_at: date("expires_at").notNull(),
  ip_address: varchar("ip_address").notNull(),
  user_agent: varchar("user_agent").notNull(),
  active_workspace_id: uuid("active_workspace_id"),
  // Metadata
  ...tableMetadata,
});

export const AccountsTable = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  // References
  user_id: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
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
  id: uuid("id").primaryKey().defaultRandom(),
  // General
  identifier: varchar("identifier").notNull(),
  value: varchar("value").notNull(),
  expires_at: date("expires_at").notNull(),
  // Metadata
  ...tableMetadata,
});

export type Workspace = InferSelectModel<typeof workspacesTable>;
export const workspacesTable = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  // General
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull(),
  logo_url: varchar("logo_url"),
  metadata: varchar("metadata"),
  // Metadata
  ...tableMetadata,
});

export const membersTable = pgTable("members", {
  id: uuid("id").primaryKey().defaultRandom(),
  // References
  user_id: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  workspace_id: uuid("workspace_id")
    .references(() => workspacesTable.id, { onDelete: "cascade" })
    .notNull(),
  // General
  role: varchar("role").notNull(),
  // Metadata
  ...tableMetadata,
});

export const invitationsTable = pgTable("invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  // References
  inviter_id: uuid("inviter_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  workspace_id: uuid("workspace_id")
    .references(() => workspacesTable.id, { onDelete: "cascade" })
    .notNull(),
  // General
  email: varchar("email").notNull(),
  role: varchar("role").notNull(),
  status: varchar("status").notNull(),
  expires_at: date("expires_at").notNull(),
  // Metadata
  ...tableMetadata,
});

export type InsertProject = InferInsertModel<typeof projectsTable>;
export type Project = InferSelectModel<typeof projectsTable>;
export const projectsTable = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  // References
  workspace_id: uuid("workspace_id")
    .references(() => workspacesTable.id, { onDelete: "cascade" })
    .notNull(),
  creator_id: uuid("creator_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  lead_id: uuid("lead_id").references(() => usersTable.id, {
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
  id: uuid("id").primaryKey().defaultRandom(),
  // References
  project_id: uuid("project_id")
    .references(() => projectsTable.id, { onDelete: "cascade" })
    .notNull(),
  // General
  name: varchar("name").notNull(),
  // Metadata
  ...tableMetadata,
});

export type TimeEntry = InferSelectModel<typeof timeEntriesTable>;
export const timeEntriesTable = pgTable("time_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  // References
  user_id: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  activity_id: uuid("activity_id")
    .references(() => activitiesTable.id, { onDelete: "cascade" })
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
