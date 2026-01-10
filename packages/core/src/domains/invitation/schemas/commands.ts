import { Schema } from "effect";
import { WorkspaceInvitation } from "./workspace-invitation.model";

const workspaceInvitationFields = WorkspaceInvitation.from.fields;

export const WorkspaceInvitationCommands = {
  Create: Schema.Struct({
    email: workspaceInvitationFields.email,
    role: workspaceInvitationFields.role,
  }),
};

export type CreateWorkspaceInvitationCommand =
  typeof WorkspaceInvitationCommands.Create.Type;
