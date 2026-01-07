import { Schema } from "effect";

export type UserId = typeof UserId.Type;
export const UserId = Schema.UUID.pipe(Schema.brand("UserId"));

export type MemberId = typeof MemberId.Type;
export const MemberId = Schema.UUID.pipe(Schema.brand("MemberId"));

export type ProjectId = typeof ProjectId.Type;
export const ProjectId = Schema.UUID.pipe(Schema.brand("ProjectId"));

export type TaskId = typeof TaskId.Type;
export const TaskId = Schema.UUID.pipe(Schema.brand("TaskId"));

export type TimeEntryId = typeof TimeEntryId.Type;
export const TimeEntryId = Schema.UUID.pipe(Schema.brand("TimeEntryId"));

export type WorkspaceId = typeof WorkspaceId.Type;
export const WorkspaceId = Schema.UUID.pipe(Schema.brand("WorkspaceId"));

export type WorkspaceInvitationId = typeof WorkspaceInvitationId.Type;
export const WorkspaceInvitationId = Schema.UUID.pipe(
  Schema.brand("WorkspaceInvitationId")
);

export type WorkspaceIntegrationId = typeof WorkspaceIntegrationId.Type;
export const WorkspaceIntegrationId = Schema.UUID.pipe(
  Schema.brand("WorkspaceIntegrationId")
);
