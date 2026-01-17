import { Effect, Option } from "effect";
import type { TimeEntryId, WorkspaceId } from "~/shared/schemas";
import { TimeEntryNotFoundError } from "../errors";
import { TimeEntryRepository } from "../repositories/time-entry.repo";

export interface HardDeleteTimeEntryInput {
  id: TimeEntryId;
  workspaceId: WorkspaceId;
}

export type HardDeleteTimeEntryOutput = void;

export const HardDeleteTimeEntryAction = Effect.fn(
  "time/HardDeleteTimeEntryAction"
)(function* (input: HardDeleteTimeEntryInput) {
  const timeEntryRepo = yield* TimeEntryRepository;

  const timeEntry = yield* timeEntryRepo
    .retrieve({
      workspaceId: input.workspaceId,
      query: { id: input.id },
    })
    .pipe(
      Effect.map(Option.getOrThrowWith(() => new TimeEntryNotFoundError()))
    );

  yield* timeEntryRepo.hardDelete({
    workspaceId: input.workspaceId,
    timeEntryIds: [timeEntry.id],
  });
});
