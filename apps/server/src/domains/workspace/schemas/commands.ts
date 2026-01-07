import { Schema } from "effect";
import { Workspace } from "./workspace.model";

const WorkspaceFields = Workspace.from.fields;

export const WorkspaceCommands = {
  Create: Schema.Struct({
    name: WorkspaceFields.name,
    slug: WorkspaceFields.slug,
  }),
  Update: Schema.Struct({
    workspaceId: WorkspaceFields.id,
    name: Schema.optionalWith(WorkspaceFields.name, { exact: true }),
    slug: Schema.optionalWith(WorkspaceFields.slug, { exact: true }),
    logoUrl: Schema.optionalWith(WorkspaceFields.logoUrl, { exact: true }),
    metadata: Schema.optionalWith(WorkspaceFields.metadata, { exact: true }),
  }),
};

export type CreateWorkspaceCommand = typeof WorkspaceCommands.Create.Type;
export type UpdateWorkspaceCommand = typeof WorkspaceCommands.Update.Type;
