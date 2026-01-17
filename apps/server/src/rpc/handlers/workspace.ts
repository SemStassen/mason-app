import {
  CheckWorkspaceSlugIsUniqueFlow,
  CreateWorkspaceFlow,
  PatchWorkspaceFlow,
  SetActiveWorkspaceFlow,
  WorkspaceRpcs,
} from "@mason/core";

export const WorkspaceRpcsLive = WorkspaceRpcs.toLayer({
  "Workspace.Create": CreateWorkspaceFlow,
  "Workspace.Patch": PatchWorkspaceFlow,
  "Workspace.CheckSlugIsUnique": CheckWorkspaceSlugIsUniqueFlow,
  "Workspace.SetActive": SetActiveWorkspaceFlow,
});
