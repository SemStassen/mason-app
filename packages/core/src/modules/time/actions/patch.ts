import { Effect, Option } from "effect";
import type { TimeEntryId, WorkspaceId } from "~/shared/schemas";
import type { PatchTimeEntry } from "../domain";
import { TimeEntryNotFoundError } from "../errors";
import { TimeEntryRepository } from "../repositories/time-entry.repo";

export interface PatchTimeEntryInput {
  id: TimeEntryId;
  workspaceId: WorkspaceId;
  patch: PatchTimeEntry;
}

export type PatchTimeEntryOutput = void;

export const PatchTimeEntryAction = Effect.fn("time/PatchTimeEntryAction")(
  function* (input: PatchTimeEntryInput) {
    const timeEntryRepo = yield* TimeEntryRepository;

    const timeEntry = yield* timeEntryRepo
      .retrieve({
        workspaceId: input.workspaceId,
        query: { id: input.id },
      })
      .pipe(
        Effect.map(Option.getOrThrowWith(() => new TimeEntryNotFoundError()))
      );

    const updatedTimeEntry = yield* timeEntry.patch(input.patch);

    yield* timeEntryRepo.update({
      workspaceId: input.workspaceId,
      timeEntries: [updatedTimeEntry],
    });
  }
);
