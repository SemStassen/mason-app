import { Effect, type Option } from "effect";
import type { TimeEntryId, WorkspaceId } from "~/shared/schemas";
import type { TimeEntry } from "../domain";
import { TimeEntryRepository } from "../repositories";

export interface RetrieveTimeEntryInput {
  id: TimeEntryId;
  workspaceId: WorkspaceId;
}

export type RetrieveTimeEntryOutput = Option.Option<TimeEntry>;

export const RetrieveTimeEntryAction = Effect.fn(
  "time/RetrieveTimeEntryAction"
)(function* (input: RetrieveTimeEntryInput) {
  const timeEntryRepo = yield* TimeEntryRepository;

  const maybeTimeEntry = yield* timeEntryRepo.retrieve({
    workspaceId: input.workspaceId,
    query: { id: input.id },
  });

  return maybeTimeEntry;
});
