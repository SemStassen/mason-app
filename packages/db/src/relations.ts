import { defineRelations } from "drizzle-orm";
// biome-ignore lint/performance/noNamespaceImport: Needed for schema
import * as schema from "./schema";

const identityRelations = defineRelations(schema, (r) => ({
  usersTable: {
    sessions: r.many.sessionsTable(),
    accounts: r.many.accountsTable(),
    workspaceMemberships: r.many.workspaceMembersTable(),
  },
  sessionsTable: {
    user: r.one.usersTable({
      from: r.sessionsTable.userId,
      to: r.usersTable.id,
    }),
  },
  accountsTable: {
    user: r.one.usersTable({
      from: r.accountsTable.userId,
      to: r.usersTable.id,
    }),
  },
}));

const integrationRelations = defineRelations(schema, (r) => ({
  workspaceIntegrationsTable: {
    workspace: r.one.workspacesTable({
      from: r.workspaceIntegrationsTable.workspaceId,
      to: r.workspacesTable.id,
    }),
    createdByWorkspaceMember: r.one.workspaceMembersTable({
      from: r.workspaceIntegrationsTable.createdByWorkspaceMemberId,
      to: r.workspaceMembersTable.id,
    }),
  },
  projectIntegrationsTable: {
    workspace: r.one.workspacesTable({
      from: r.projectIntegrationsTable.workspaceId,
      to: r.workspacesTable.id,
    }),
    project: r.one.projectsTable({
      from: r.projectIntegrationsTable.projectId,
      to: r.projectsTable.id,
    }),
  },
  taskIntegrationsTable: {
    workspace: r.one.workspacesTable({
      from: r.taskIntegrationsTable.workspaceId,
      to: r.workspacesTable.id,
    }),
    task: r.one.tasksTable({
      from: r.taskIntegrationsTable.taskId,
      to: r.tasksTable.id,
    }),
  },
}));

const workspaceMemberRelations = defineRelations(schema, (r) => ({
  workspaceMembersTable: {
    user: r.one.usersTable({
      from: r.workspaceMembersTable.userId,
      to: r.usersTable.id,
    }),
    workspace: r.one.workspacesTable({
      from: r.workspaceMembersTable.workspaceId,
      to: r.workspacesTable.id,
    }),
    sentWorkspaceInvitations: r.many.workspaceInvitationsTable(),
    timeEntries: r.many.timeEntriesTable(),
  },
}));

const projectRelations = defineRelations(schema, (r) => ({
  projectsTable: {
    workspace: r.one.workspacesTable({
      from: r.projectsTable.workspaceId,
      to: r.workspacesTable.id,
    }),
    tasks: r.many.tasksTable(),
    timeEntries: r.many.timeEntriesTable(),
    integrations: r.many.projectIntegrationsTable(),
  },
  tasksTable: {
    project: r.one.projectsTable({
      from: r.tasksTable.projectId,
      to: r.projectsTable.id,
    }),
    timeEntries: r.many.timeEntriesTable(),
    integrations: r.many.taskIntegrationsTable(),
  },
}));

const timeRelations = defineRelations(schema, (r) => ({
  timeEntriesTable: {
    workspaceMember: r.one.workspaceMembersTable({
      from: r.timeEntriesTable.workspaceMemberId,
      to: r.workspaceMembersTable.id,
    }),
    project: r.one.projectsTable({
      from: r.timeEntriesTable.projectId,
      to: r.projectsTable.id,
    }),
    task: r.one.tasksTable({
      from: r.timeEntriesTable.taskId,
      to: r.tasksTable.id,
    }),
  },
}));

const workspaceRelations = defineRelations(schema, (r) => ({
  workspacesTable: {
    members: r.many.workspaceMembersTable(),
    integrations: r.many.workspaceIntegrationsTable(),
    projects: r.many.projectsTable(),
    timeEntries: r.many.timeEntriesTable(),
  },
}));

const workspaceInvitationRelations = defineRelations(schema, (r) => ({
  workspaceInvitationsTable: {
    workspace: r.one.workspacesTable({
      from: r.workspaceInvitationsTable.workspaceId,
      to: r.workspacesTable.id,
    }),
    inviter: r.one.workspaceMembersTable({
      from: r.workspaceInvitationsTable.inviterId,
      to: r.workspaceMembersTable.id,
    }),
  },
}));

export const relations = {
  ...identityRelations,
  ...integrationRelations,
  ...workspaceMemberRelations,
  ...projectRelations,
  ...timeRelations,
  ...workspaceRelations,
  ...workspaceInvitationRelations,
} as const;
