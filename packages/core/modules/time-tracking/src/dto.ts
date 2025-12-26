import type { TimeEntryId } from "@mason/framework";
import type { CreateTimeEntry, PatchTimeEntry } from "./time-entry.model";

export interface TimeEntryToCreateDTO {
  workspaceId: typeof CreateTimeEntry.Type.workspaceId;
  memberId: typeof CreateTimeEntry.Type.memberId;
  projectId: typeof CreateTimeEntry.Type.projectId;
  taskId?: typeof CreateTimeEntry.Type.taskId;
  startedAt: typeof CreateTimeEntry.Type.startedAt;
  stoppedAt: typeof CreateTimeEntry.Type.stoppedAt;
  notes?: typeof CreateTimeEntry.Type.notes;
}

export interface TimeEntryToUpdateDTO {
  id: TimeEntryId;
  projectId?: typeof PatchTimeEntry.Type.projectId;
  taskId?: typeof PatchTimeEntry.Type.taskId;
  startedAt?: typeof PatchTimeEntry.Type.startedAt;
  stoppedAt?: typeof PatchTimeEntry.Type.stoppedAt;
  notes?: typeof PatchTimeEntry.Type.notes;
}
