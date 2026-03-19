import { Schema } from "effect";

export type WorkspaceRole = typeof WorkspaceRole.Type;
export const WorkspaceRole = Schema.Literals(["owner", "member"]);

const WorkspaceAction = Schema.Literals([
  "workspace:invite_user",
  "workspace:cancel_invite",
  "workspace:patch",
  "workspace:delete",
  "workspace:create_integration",
  "workspace:delete_integration",
]);

const ProjectAction = Schema.Literals([
  "project:create",
  "project:patch",
  "project:archive",
  "project:restore",
  "project:create_task",
  "project:patch_task",
  "project:archive_task",
  "project:restore_task",
]);

const TimeAction = Schema.Literals([
  "time:create_time_entry",
  "time:update_time_entry",
  "time:delete_time_entry",
]);

export type Action = typeof Action.Type;
export const Action = Schema.Union([
  WorkspaceAction,
  ProjectAction,
  TimeAction,
]);
