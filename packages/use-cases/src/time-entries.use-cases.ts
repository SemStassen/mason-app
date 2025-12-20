import type { WorkspaceId } from "@mason/core/models/ids";
import type {
  TimeEntryToCreate,
  TimeEntryToUpdate,
} from "@mason/core/models/time-entry.model";
import { TimeEntryService } from "@mason/core/services/time-entry.service";
import { Effect } from "effect";

export const createTimeEntriesUseCase = Effect.fn("createTimeEntriesUseCase")(function* ({
  workspaceId,
  timeEntries,
}: {
  workspaceId: typeof WorkspaceId.Type;
  timeEntries: Array<typeof TimeEntryToCreate.Type>;
}) {
  const timeEntryService = yield* TimeEntryService;

  return yield* timeEntryService.createTimeEntries({
    workspaceId: workspaceId,
    timeEntries: timeEntries,
  });
});

export const updateTimeEntriesUseCase = Effect.fn("updateTimeEntriesUseCase")(function* ({
  workspaceId,
  timeEntries,
}: {
  workspaceId: typeof WorkspaceId.Type;
  timeEntries: Array<typeof TimeEntryToUpdate.Type>;
}) {
  const timeEntryService = yield* TimeEntryService;

  return yield* timeEntryService.updateTimeEntries({
    workspaceId: workspaceId,
    timeEntries: timeEntries,
  });
});

export const listTimeEntriesUseCase = Effect.fn("listTimeEntriesUseCase")(function* ({
  workspaceId,
}: {
  workspaceId: typeof WorkspaceId.Type;
}) {
  const timeEntryService = yield* TimeEntryService;

  return yield* timeEntryService.listTimeEntries({
    workspaceId: workspaceId,
  });
});
