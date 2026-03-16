import { Schema } from "effect";

export type UserId = typeof UserId.Type;
export const UserId = Schema.String.check(Schema.isUUID(7)).pipe(Schema.brand("UserId"));

export type SessionId = typeof SessionId.Type;
export const SessionId = Schema.String.check(Schema.isUUID(7)).pipe(Schema.brand("SessionId"));

export type WorkspaceIntegrationId = typeof WorkspaceIntegrationId.Type;
export const WorkspaceIntegrationId = Schema.String.check(Schema.isUUID(7)).pipe(
  Schema.brand("WorkspaceIntegrationId")
);

export type WorkspaceMemberId = typeof WorkspaceMemberId.Type;
export const WorkspaceMemberId = Schema.String.check(Schema.isUUID(7)).pipe(Schema.brand("WorkspaceMemberId"));

export type ProjectId = typeof ProjectId.Type;
export const ProjectId = Schema.String.check(Schema.isUUID(7)).pipe(Schema.brand("ProjectId"));

export type TaskId = typeof TaskId.Type;
export const TaskId = Schema.String.check(Schema.isUUID(7)).pipe(Schema.brand("TaskId"));

export type TimeEntryId = typeof TimeEntryId.Type;
export const TimeEntryId = Schema.String.check(Schema.isUUID(7)).pipe(Schema.brand("TimeEntryId"));

export type WorkspaceId = typeof WorkspaceId.Type;
export const WorkspaceId = Schema.String.check(Schema.isUUID(7)).pipe(Schema.brand("WorkspaceId"));

export type WorkspaceInvitationId = typeof WorkspaceInvitationId.Type;
export const WorkspaceInvitationId = Schema.String.check(Schema.isUUID(7)).pipe(
  Schema.brand("WorkspaceInvitationId")
);
