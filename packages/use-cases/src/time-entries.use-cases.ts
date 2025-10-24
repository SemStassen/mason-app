import type { WorkspaceId } from "@mason/core/models/ids";
import type {
  TimeEntryToCreate,
  TimeEntryToUpdate,
} from "@mason/core/models/time-entry.model";
import { TimeEntryService } from "@mason/core/services/time-entry.service";
import { Effect } from "effect";

export const createTimeEntriesUseCase = ({
  workspaceId,
  timeEntries,
}: {
  workspaceId: typeof WorkspaceId.Type;
  timeEntries: Array<typeof TimeEntryToCreate.Type>;
}) =>
  Effect.gen(function* () {
    const timeEntryService = yield* TimeEntryService;

    return yield* timeEntryService.createTimeEntries({
      workspaceId: workspaceId,
      timeEntries: timeEntries,
    });
  });

export const updateTimeEntriesUseCase = ({
  workspaceId,
  timeEntries,
}: {
  workspaceId: typeof WorkspaceId.Type;
  timeEntries: Array<typeof TimeEntryToUpdate.Type>;
}) =>
  Effect.gen(function* () {
    const timeEntryService = yield* TimeEntryService;

    return yield* timeEntryService.updateTimeEntries({
      workspaceId: workspaceId,
      timeEntries: timeEntries,
    });
  });

export const listTimeEntriesUseCase = ({
  workspaceId,
}: {
  workspaceId: typeof WorkspaceId.Type;
}) =>
  Effect.gen(function* () {
    const timeEntryService = yield* TimeEntryService;

    return yield* timeEntryService.listTimeEntries({
      workspaceId: workspaceId,
    });
  });
