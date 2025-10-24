import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  tableId,
  tableMetadata,
  workspaceIsolationPolicy,
} from "./../snippets";
import {
  projectsTable,
  timeEntriesTable,
  workspaceIntegrationsTable,
} from "./application";

export const usersTable = pgTable("users", {
  id: tableId,
  // General
  displayName: varchar("display_name").notNull(),
  email: varchar("email").notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  imageUrl: varchar("image_url"),
  // Metadata
  ...tableMetadata,
});
export const usersRelations = relations(usersTable, ({ many }) => ({
  sessions: many(sessionsTable),
  accounts: many(accountsTable),
  memberships: many(membersTable),
}));

export type DbUser = typeof usersTable.$inferSelect;

export const sessionsTable = pgTable("sessions", {
  id: tableId,
  // References
  userId: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  // General
  sessionToken: varchar("session_token").notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    precision: 0,
  }).notNull(),
  ipAddress: varchar("ip_address").notNull(),
  userAgent: varchar("user_agent").notNull(),
  activeWorkspaceId: uuid("active_workspace_id"),
  // Metadata
  ...tableMetadata,
});
export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}));

export type DbSession = typeof sessionsTable.$inferSelect;

export const jwksTable = pgTable("jwks", {
  id: tableId,
  publicKey: varchar("public_key").notNull(),
  privateKey: varchar("private_key").notNull(),
  // Metadata
  createdAt: tableMetadata.createdAt,
});

export const accountsTable = pgTable("accounts", {
  id: tableId,
  // References
  userId: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  // General
  accountId: varchar("account_id").notNull(),
  providerId: varchar("provider_id").notNull(),
  accessToken: varchar("access_token"),
  refreshToken: varchar("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    withTimezone: true,
    precision: 0,
  }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    withTimezone: true,
    precision: 0,
  }),
  scope: varchar("scope"),
  idToken: varchar("id_token"),
  password: varchar("password"),
  // Metadata
  ...tableMetadata,
});
export const accountsRelations = relations(accountsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [accountsTable.userId],
    references: [usersTable.id],
  }),
}));

export type DbAccount = typeof accountsTable.$inferSelect;

export const verificationsTable = pgTable("verifications", {
  id: tableId,
  // General
  identifier: varchar("identifier").notNull(),
  value: varchar("value").notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    precision: 0,
  }).notNull(),
  // Metadata
  ...tableMetadata,
});
export const verificationsRelations = relations(verificationsTable, () => ({}));

export type DbVerification = typeof verificationsTable.$inferSelect;

export const workspacesTable = pgTable(
  "workspaces",
  {
    id: tableId,
    // General
    name: varchar("name").notNull(),
    slug: varchar("slug").notNull(),
    logoUrl: varchar("logo_url"),
    metadata: varchar("metadata"),
    // Metadata
    ...tableMetadata,
  },
  () => [workspaceIsolationPolicy("workspaces")]
);
export const workspacesRelations = relations(workspacesTable, ({ many }) => ({
  members: many(membersTable),
  invitations: many(invitationsTable),
  integrations: many(workspaceIntegrationsTable),
  projects: many(projectsTable),
}));

export type DbWorkspace = typeof workspacesTable.$inferSelect;

export const membersTable = pgTable("members", {
  id: tableId,
  // References
  userId: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  workspaceId: uuid("workspace_id")
    .references(() => workspacesTable.id, { onDelete: "cascade" })
    .notNull(),
  // General
  role: varchar("role").notNull(),
  // Metadata
  ...tableMetadata,
});
export const membersRelations = relations(membersTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [membersTable.userId],
    references: [usersTable.id],
  }),
  workspace: one(workspacesTable, {
    fields: [membersTable.workspaceId],
    references: [workspacesTable.id],
  }),
  sentInvitations: many(invitationsTable),
  timeEntries: many(timeEntriesTable),
}));

export type DbMember = typeof membersTable.$inferSelect;

export const invitationsTable = pgTable(
  "invitations",
  {
    id: tableId,
    // References
    inviterId: uuid("inviter_id")
      .references(() => membersTable.id, { onDelete: "cascade" })
      .notNull(),
    workspaceId: uuid("workspace_id")
      .references(() => workspacesTable.id, { onDelete: "cascade" })
      .notNull(),
    // General
    email: varchar("email").notNull(),
    role: varchar("role").notNull(),
    status: varchar("status").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      precision: 0,
    }).notNull(),
    // Metadata
    ...tableMetadata,
  },
  () => [workspaceIsolationPolicy("invitations")]
);
export const invitationsRelations = relations(invitationsTable, ({ one }) => ({
  inviter: one(usersTable, {
    fields: [invitationsTable.inviterId],
    references: [usersTable.id],
  }),
  workspace: one(workspacesTable, {
    fields: [invitationsTable.workspaceId],
    references: [workspacesTable.id],
  }),
}));

export type DbInvitation = typeof invitationsTable.$inferSelect;
