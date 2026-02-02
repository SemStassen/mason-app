import { Effect } from "effect";
import { TimeEntry } from "../domain/time-entry.model";
import { TimeEntryRepository } from "../repositories/time-entry.repo";

export type CreateTimeEntryInput = typeof TimeEntry.create.Type;

export type CreateTimeEntryOutput = void;

export const CreateTimeEntryAction = Effect.fn("time/CreateTimeEntryAction")(
  function* (input: CreateTimeEntryInput) {
    const timeEntryRepo = yield* TimeEntryRepository;

    const timeEntry = yield* TimeEntry.fromInput(input);

    yield* timeEntryRepo.insert({
      timeEntries: [timeEntry],
    });
  }
);
