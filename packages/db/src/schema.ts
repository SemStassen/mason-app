import {
  boolean,
  json,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { createSchemaFactory } from 'drizzle-zod';
import z from 'zod';
import { tableId, tableMetadata } from './snippets';

const { createInsertSchema, createSelectSchema, createUpdateSchema } =
  createSchemaFactory({ zodInstance: z });

export const usersTable = pgTable('users', {
  id: tableId,
  // General
  displayName: varchar('display_name').notNull(),
  email: varchar('email').notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  imageUrl: varchar('image_url'),
  // Metadata
  ...tableMetadata,
});
export const createUserSchema = createInsertSchema(usersTable);
export const selectUserSchema = createSelectSchema(usersTable);
export const updateUserSchema = createUpdateSchema(usersTable);
export type User = z.infer<typeof selectUserSchema>;

export const sessionsTable = pgTable('sessions', {
  id: tableId,
  // References
  userId: uuid('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  // General
  sessionToken: varchar('session_token').notNull(),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    precision: 0,
  }).notNull(),
  ipAddress: varchar('ip_address').notNull(),
  userAgent: varchar('user_agent').notNull(),
  activeWorkspaceId: uuid('active_workspace_id'),
  // Metadata
  ...tableMetadata,
});
export const createSessionSchema = createInsertSchema(sessionsTable);
export const selectSessionSchema = createSelectSchema(sessionsTable);
export const updateSessionSchema = createUpdateSchema(sessionsTable);
export type Session = z.infer<typeof selectSessionSchema>;

export const accountsTable = pgTable('accounts', {
  id: tableId,
  // References
  userId: uuid('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  // General
  accountId: varchar('account_id').notNull(),
  providerId: varchar('provider_id').notNull(),
  accessToken: varchar('access_token'),
  refreshToken: varchar('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', {
    withTimezone: true,
    precision: 0,
  }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
    withTimezone: true,
    precision: 0,
  }),
  scope: varchar('scope'),
  idToken: varchar('id_token'),
  password: varchar('password'),
  // Metadata
  ...tableMetadata,
});
export const createAccountSchema = createInsertSchema(accountsTable);
export const selectAccountSchema = createSelectSchema(accountsTable);
export const updateAccountSchema = createUpdateSchema(accountsTable);
export type Account = z.infer<typeof selectAccountSchema>;

export const verificationsTable = pgTable('verifications', {
  id: tableId,
  // General
  identifier: varchar('identifier').notNull(),
  value: varchar('value').notNull(),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    precision: 0,
  }).notNull(),
  // Metadata
  ...tableMetadata,
});
export const createVerificationSchema = createInsertSchema(verificationsTable);
export const selectVerificationSchema = createSelectSchema(verificationsTable);
export const updateVerificationSchema = createUpdateSchema(verificationsTable);
export type Verification = z.infer<typeof selectVerificationSchema>;

export const workspacesTable = pgTable('workspaces', {
  id: tableId,
  // General
  name: varchar('name').notNull(),
  slug: varchar('slug').notNull(),
  logoUrl: varchar('logo_url'),
  metadata: varchar('metadata'),
  // Metadata
  ...tableMetadata,
});
export const createWorkspaceSchema = createInsertSchema(workspacesTable);
export const selectWorkspaceSchema = createSelectSchema(workspacesTable);
export const updateWorkspaceSchema = createUpdateSchema(workspacesTable);
export type Workspace = z.infer<typeof selectWorkspaceSchema>;

export const membersTable = pgTable('members', {
  id: tableId,
  // References
  userId: uuid('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  workspaceId: uuid('workspace_id')
    .references(() => workspacesTable.id, { onDelete: 'cascade' })
    .notNull(),
  // General
  role: varchar('role').notNull(),
  // Metadata
  ...tableMetadata,
});
export const createMemberSchema = createInsertSchema(membersTable);
export const selectMemberSchema = createSelectSchema(membersTable);
export const updateMemberSchema = createUpdateSchema(membersTable);
export type Member = z.infer<typeof selectMemberSchema>;

export const invitationsTable = pgTable('invitations', {
  id: tableId,
  // References
  inviterId: uuid('inviter_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  workspaceId: uuid('workspace_id')
    .references(() => workspacesTable.id, { onDelete: 'cascade' })
    .notNull(),
  // General
  email: varchar('email').notNull(),
  role: varchar('role').notNull(),
  status: varchar('status').notNull(),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    precision: 0,
  }).notNull(),
  // Metadata
  ...tableMetadata,
});
export const createInvitationSchema = createInsertSchema(invitationsTable);
export const selectInvitationSchema = createSelectSchema(invitationsTable);
export const updateInvitationSchema = createUpdateSchema(invitationsTable);
export type Invitation = z.infer<typeof selectInvitationSchema>;

export const projectsTable = pgTable('projects', {
  id: tableId,
  // References
  workspaceId: uuid('workspace_id')
    .references(() => workspacesTable.id, { onDelete: 'cascade' })
    .notNull(),
  creatorId: uuid('creator_id').references(() => usersTable.id, {
    onDelete: 'set null',
  }),
  leadId: uuid('lead_id').references(() => usersTable.id, {
    onDelete: 'set null',
  }),
  // General
  name: varchar('name').notNull(),
  hexColor: varchar('hex_color').notNull(),
  isBillable: boolean('is_billable').default(true).notNull(),
  notes: json('notes').$type<{
    // Generic object type
    [key: string]: string;
  }>(),
  // Metadata
  ...tableMetadata,
});
export const createProjectSchema = createInsertSchema(projectsTable);
export const selectProjectSchema = createSelectSchema(projectsTable);
export const updateProjectSchema = createUpdateSchema(projectsTable);
export type Project = z.infer<typeof selectProjectSchema>;

export const activitiesTable = pgTable('activities', {
  id: tableId,
  // References
  projectId: uuid('project_id')
    .references(() => projectsTable.id, { onDelete: 'cascade' })
    .notNull(),
  // General
  name: varchar('name').notNull(),
  // Metadata
  ...tableMetadata,
});
export const createActivitySchema = createInsertSchema(activitiesTable);
export const selectActivitySchema = createSelectSchema(activitiesTable);
export const updateActivitySchema = createUpdateSchema(activitiesTable);
export type Activity = z.infer<typeof selectActivitySchema>;

export const timeEntriesTable = pgTable('time_entries', {
  id: tableId,
  // References
  userId: uuid('user_id')
    .references(() => usersTable.id, { onDelete: 'cascade' })
    .notNull(),
  activityId: uuid('activity_id')
    .references(() => activitiesTable.id, { onDelete: 'cascade' })
    .notNull(),
  // General
  startedAt: timestamp('started_at', {
    withTimezone: true,
    precision: 0,
  }).notNull(),
  stoppedAt: timestamp('stopped_at', {
    withTimezone: true,
    precision: 0,
  }),
  // Metadata
  ...tableMetadata,
});
export const createTimeEntrySchema = createInsertSchema(timeEntriesTable);
export const selectTimeEntrySchema = createSelectSchema(timeEntriesTable);
export const updateTimeEntrySchema = createUpdateSchema(timeEntriesTable);
export type TimeEntry = z.infer<typeof selectTimeEntrySchema>;
