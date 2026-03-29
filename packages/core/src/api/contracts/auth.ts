import { Schema } from "effect";

import { Workspace } from "#modules/workspace/index";

export const SetLastActiveWorkspaceCommand = Schema.Struct({
  id: Workspace.fields.id,
});
export const SetLastActiveWorkspaceResult = Schema.Void;
