import { Schema } from "effect";

// User
export type UserId = typeof UserId.Type;
export const UserId = Schema.UUID.pipe(Schema.brand("UserId"));

export type ExistingUserId = typeof ExistingUserId.Type;
export const ExistingUserId = Schema.UUID.pipe(Schema.brand("ExistingUserId"));

// Member
export type MemberId = typeof MemberId.Type;
export const MemberId = Schema.UUID.pipe(Schema.brand("MemberId"));

export type ExistingMemberId = typeof ExistingMemberId.Type;
export const ExistingMemberId = Schema.UUID.pipe(
  Schema.brand("ExistingMemberId")
);

// Project
export type ProjectId = typeof ProjectId.Type;
export const ProjectId = Schema.UUID.pipe(Schema.brand("ProjectId"));

export type ExistingProjectId = typeof ExistingProjectId.Type;
export const ExistingProjectId = Schema.UUID.pipe(
  Schema.brand("ExistingProjectId")
);

// Task
export type TaskId = typeof TaskId.Type;
export const TaskId = Schema.UUID.pipe(Schema.brand("TaskId"));

export type ExistingTaskId = typeof ExistingTaskId.Type;
export const ExistingTaskId = Schema.UUID.pipe(Schema.brand("ExistingTaskId"));

// Time Entry
export type TimeEntryId = typeof TimeEntryId.Type;
export const TimeEntryId = Schema.UUID.pipe(Schema.brand("TimeEntryId"));

export type ExistingTimeEntryId = typeof ExistingTimeEntryId.Type;
export const ExistingTimeEntryId = Schema.UUID.pipe(
  Schema.brand("ExistingTimeEntryId")
);

// Workspace
export type WorkspaceId = typeof WorkspaceId.Type;
export const WorkspaceId = Schema.UUID.pipe(Schema.brand("WorkspaceId"));

export type ExistingWorkspaceId = typeof ExistingWorkspaceId.Type;
export const ExistingWorkspaceId = Schema.UUID.pipe(
  Schema.brand("ExistingWorkspaceId")
);

// Workspace Integration
export type WorkspaceIntegrationId = typeof WorkspaceIntegrationId.Type;
export const WorkspaceIntegrationId = Schema.UUID.pipe(
  Schema.brand("WorkspaceIntegrationId")
);

export type ExistingWorkspaceIntegrationId =
  typeof ExistingWorkspaceIntegrationId.Type;
export const ExistingWorkspaceIntegrationId = Schema.UUID.pipe(
  Schema.brand("ExistingWorkspaceIntegrationId")
);
