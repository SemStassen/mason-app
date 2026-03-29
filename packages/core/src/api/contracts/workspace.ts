import { Schema } from "effect";

import { Workspace } from "#modules/workspace/index";

export const CreateWorkspaceCommand = Workspace.jsonCreate;
export const CreateWorkspaceResult = Workspace.json;

export const UpdateWorkspaceCommand = Workspace.jsonUpdate;
export const UpdateWorkspaceResult = Workspace.json;

export const CheckWorkspaceSlugIsUniqueCommand = Schema.Struct({
  slug: Workspace.fields.slug,
});
export const CheckWorkspaceSlugIsUniqueResult = Schema.Struct({
  isUnique: Schema.Boolean,
});

export const ListWorkspacesCommand = Schema.Void;
export const ListWorkspacesResult = Schema.Array(Workspace.json);
