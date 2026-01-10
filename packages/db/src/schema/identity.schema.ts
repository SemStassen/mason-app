import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { tableId, tableMetadata } from "../utils";
import { membersTable } from "./member.schema";

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
