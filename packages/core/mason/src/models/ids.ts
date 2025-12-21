import { Schema } from "effect";

export const UserId = Schema.NonEmptyString.pipe(Schema.brand("UserId"));
export const MemberId = Schema.NonEmptyString.pipe(Schema.brand("MemberId"));

export const ProjectId = Schema.NonEmptyString.pipe(Schema.brand("ProjectId"));
export const TaskId = Schema.NonEmptyString.pipe(Schema.brand("TaskId"));
export const TimeEntryId = Schema.NonEmptyString.pipe(
  Schema.brand("TimeEntryId")
);
export const WorkspaceId = Schema.NonEmptyString.pipe(
  Schema.brand("WorkspaceId")
);
export const WorkspaceIntegrationId = Schema.NonEmptyString.pipe(
  Schema.brand("WorkspaceIntegrationId")
);
