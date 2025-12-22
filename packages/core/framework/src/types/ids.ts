import { Schema } from "effect";

export type UserId = typeof UserId.Type;
export const UserId = Schema.NonEmptyString.pipe(Schema.brand("UserId"));

export type MemberId = typeof MemberId.Type;
export const MemberId = Schema.NonEmptyString.pipe(Schema.brand("MemberId"));

export type ProjectId = typeof ProjectId.Type;
export const ProjectId = Schema.NonEmptyString.pipe(Schema.brand("ProjectId"));

export type TaskId = typeof TaskId.Type;
export const TaskId = Schema.NonEmptyString.pipe(Schema.brand("TaskId"));

export type TimeEntryId = typeof TimeEntryId.Type;
export const TimeEntryId = Schema.NonEmptyString.pipe(
  Schema.brand("TimeEntryId")
);

export type WorkspaceId = typeof WorkspaceId.Type;
export const WorkspaceId = Schema.NonEmptyString.pipe(
  Schema.brand("WorkspaceId")
);

export type WorkspaceIntegrationId = typeof WorkspaceIntegrationId.Type;
export const WorkspaceIntegrationId = Schema.NonEmptyString.pipe(
  Schema.brand("WorkspaceIntegrationId")
);

// Misc.
export type ApiKey = typeof ApiKey.Type;
export const ApiKey = Schema.NonEmptyString.pipe(Schema.brand("ApiKey"));
