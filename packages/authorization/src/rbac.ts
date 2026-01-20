import { Schema } from "effect";

const WorkspaceAction = Schema.Literal(
  "workspace:invite_user",
  "workspace:cancel_invite",
  "workspace:patch",
  "workspace:delete",
  "workspace:create_integration",
  "workspace:delete_integration"
);

const ProjectAction = Schema.Literal(
  "project:create",
  "project:patch",
  "project:archive",
  "project:restore",
  "project:create_task",
  "project:patch_task",
  "project:archive_task",
  "project:restore_task"
);

export type Action = typeof Action.Type;
export const Action = Schema.Union(WorkspaceAction, ProjectAction);
