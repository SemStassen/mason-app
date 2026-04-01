import {
  createWorkspaceCollections,
  type WorkspaceCollections,
} from "./collections";

let activeWorkspaceId: string | null = null;
let activeWorkspacePromise: Promise<WorkspaceCollections> | null = null;

export function getWorkspaceCollections(
  workspaceId: string
): Promise<WorkspaceCollections> {
  if (workspaceId === activeWorkspaceId && activeWorkspacePromise !== null) {
    return activeWorkspacePromise;
  }

  activeWorkspaceId = workspaceId;
  activeWorkspacePromise = createWorkspaceCollections(workspaceId);

  return activeWorkspacePromise;
}
