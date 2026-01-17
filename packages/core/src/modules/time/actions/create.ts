import { Effect } from "effect";
import { type CreateTimeEntry, TimeEntry } from "../domain";
import { TimeEntryRepository } from "../repositories/time-entry.repo";

export type CreateTimeEntryInput = CreateTimeEntry;

export type CreateTimeEntryOutput = void;

export const CreateTimeEntryAction = Effect.fn("time/CreateTimeEntryAction")(
  function* (input: CreateTimeEntryInput) {
    const timeEntryRepo = yield* TimeEntryRepository;

    const timeEntry = yield* TimeEntry.create(input);

    yield* timeEntryRepo.insert({
      timeEntries: [timeEntry],
    });
  }
);
