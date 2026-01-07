import { Schema } from "effect";
import { WorkspaceInvitation } from "./workspace-invitation.model";

const workspaceInvitationFields = WorkspaceInvitation.from.fields;

export const WorkspaceInvitationCommands = {
  Create: Schema.Struct({
    email: workspaceInvitationFields.email,
    role: workspaceInvitationFields.role,
  }),
  Update: Schema.Struct({
    id: workspaceInvitationFields.id,
    role: Schema.optionalWith(workspaceInvitationFields.role, { exact: true }),
  }),
};

export type CreateWorkspaceInvitationCommand =
  typeof WorkspaceInvitationCommands.Create.Type;
export type UpdateWorkspaceInvitationCommand =
  typeof WorkspaceInvitationCommands.Update.Type;
