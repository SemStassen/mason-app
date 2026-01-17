import { type DateTime, Effect } from "effect";
import type { TimeEntryId, WorkspaceId } from "~/shared/schemas";
import type { TimeEntry } from "../domain";
import { TimeEntryRepository } from "../repositories/time-entry.repo";

export interface ListTimeEntriesInput {
  workspaceId: WorkspaceId;
  query: {
    ids?: ReadonlyArray<TimeEntryId>;
    startedAt?: DateTime.Utc;
    stoppedAt?: DateTime.Utc;
  };
}

export type ListTimeEntriesOutput = ReadonlyArray<TimeEntry>;

export const ListTimeEntriesAction = Effect.fn("time/ListTimeEntriesAction")(
  function* (input: ListTimeEntriesInput) {
    const timeEntryRepo = yield* TimeEntryRepository;

    const timeEntries = yield* timeEntryRepo.list({
      workspaceId: input.workspaceId,
      query: input.query,
    });

    return timeEntries;
  }
);
