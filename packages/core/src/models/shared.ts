import { Schema } from "effect";

export const ProjectId = Schema.NonEmptyString.pipe(Schema.brand("ProjectId"));
export const TimeEntryId = Schema.NonEmptyString.pipe(
  Schema.brand("TimeEntryId")
);
export const UserId = Schema.NonEmptyString.pipe(Schema.brand("UserId"));
export const WorkspaceId = Schema.NonEmptyString.pipe(
  Schema.brand("WorkspaceId")
);
export const WorkspaceIntegrationId = Schema.NonEmptyString.pipe(
  Schema.brand("WorkspaceIntegrationId")
);
