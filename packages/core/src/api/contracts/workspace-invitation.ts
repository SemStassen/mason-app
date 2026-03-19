import { Schema } from "effect";

import { WorkspaceInvitation } from "#modules/workspace-invitation/index";

export const CreateWorkspaceInvitationCommand = WorkspaceInvitation.jsonCreate;
export const CreateWorkspaceInvitationResult = WorkspaceInvitation.json;

export const CancelWorkspaceInvitationCommand = Schema.Struct({
  id: WorkspaceInvitation.fields.id,
});
export const CancelWorkspaceInvitationResult = Schema.Void;

export const AcceptWorkspaceInvitationCommand = Schema.Struct({
  id: WorkspaceInvitation.fields.id,
});
export const AcceptWorkspaceInvitationResult = Schema.Void;

export const RejectWorkspaceInvitationCommand = Schema.Struct({
  id: WorkspaceInvitation.fields.id,
});
export const RejectWorkspaceInvitationResult = Schema.Void;
