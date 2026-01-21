import { defineRelations } from "drizzle-orm";
import { schema } from ".";

const identityRelations = defineRelations(schema, (r) => ({
  usersTable: {
    sessions: r.many.sessionsTable(),
    accounts: r.many.accountsTable(),
    memberships: r.many.membersTable(),
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
    createdByMember: r.one.membersTable({
      from: r.workspaceIntegrationsTable.createdByMemberId,
      to: r.membersTable.id,
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

const memberRelations = defineRelations(schema, (r) => ({
  membersTable: {
    user: r.one.usersTable({
      from: r.membersTable.userId,
      to: r.usersTable.id,
    }),
    workspace: r.one.workspacesTable({
      from: r.membersTable.workspaceId,
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
    member: r.one.membersTable({
      from: r.timeEntriesTable.memberId,
      to: r.membersTable.id,
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
    members: r.many.membersTable(),
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
    inviter: r.one.membersTable({
      from: r.workspaceInvitationsTable.inviterId,
      to: r.membersTable.id,
    }),
  },
}));

export const relations = {
  ...identityRelations,
  ...integrationRelations,
  ...memberRelations,
  ...projectRelations,
  ...timeRelations,
  ...workspaceRelations,
  ...workspaceInvitationRelations,
} as const;
