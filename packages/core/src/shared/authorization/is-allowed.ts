import { Schema } from "effect";

import type { Action, WorkspaceRole } from "./actions";

export class AuthorizationError extends Schema.TaggedErrorClass<AuthorizationError>()(
  "authorization/AuthorizationError",
  {}
) {}

const permissionRules: Record<Action, ReadonlyArray<WorkspaceRole>> = {
  "workspace:invite_user": ["owner"],
  "workspace:cancel_invite": ["owner"],
  "workspace:patch": ["owner"],
  "workspace:delete": ["owner"],
  "workspace:create_integration": ["owner"],
  "workspace:delete_integration": ["owner"],

  "project:create": ["owner"],
  "project:patch": ["owner"],
  "project:archive": ["owner"],
  "project:restore": ["owner"],
  "project:create_task": ["owner"],
  "project:patch_task": ["owner"],
  "project:archive_task": ["owner"],
  "project:restore_task": ["owner"],

  "time:create_time_entry": ["owner"],
  "time:update_time_entry": ["owner"],
  "time:delete_time_entry": ["owner"],
};

export function isAllowed(params: {
  action: Action;
  role: WorkspaceRole;
}): boolean {
  if (!permissionRules[params.action].includes(params.role)) {
    return false;
  }

  return true;
}
