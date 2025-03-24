import type { InferSelectModel } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

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

// export type Team = InferSelectModel<typeof teamsTable>;
// export const teamsTable = pgTable("teams", {
//   uuid: uuid("uuid").primaryKey().defaultRandom(),
//   // References
//   workspace_uuid: uuid("workspace_uuid")
//     .references(() => workspacesTable.uuid, {
//       onDelete: "cascade",
//     })
//     .notNull(),
//   // General
//   name: varchar("name").notNull(),
// });

// export const teamRelations = relations(teamsTable, ({ many }) => ({
//   users: many(usersToTeamsTable),
// }));

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
  name: varchar("name").notNull(),
  display_name: varchar("display_name").notNull(),
  // Metadata
  ...tableMetadata,
});

// export const userRelations = relations(usersTable, ({ many }) => ({
//   teams: many(usersToTeamsTable),
// }));

export type Project = InferSelectModel<typeof projectsTable>;
export const projectsTable = pgTable("projects", {
  uuid: uuid("uuid").primaryKey().defaultRandom(),
  // References
  workspace_uuid: uuid("workspace_uuid")
    .references(() => workspacesTable.uuid, { onDelete: "cascade" })
    .notNull(),
  created_by: uuid("created_by").references(() => usersTable.uuid, {
    onDelete: "set null",
  }),
  // General
  name: varchar("name").notNull(),
  // Metadata
  ...tableMetadata,
});

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

// export const usersToTeamsTable = pgTable("users_to_teams", {
//   user_uuid: uuid("user_uuid")
//     .references(() => usersTable.uuid, { onDelete: "cascade" })
//     .notNull(),
//   team_uuid: uuid("team_uuid")
//     .references(() => teamsTable.uuid, { onDelete: "cascade" })
//     .notNull(),
// });
