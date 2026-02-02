import { Context, Effect, Layer } from "effect";
import { MasonError } from "~/shared/errors";
import type {
  CreateTimeEntryInput,
  CreateTimeEntryOutput,
} from "./actions/create";
import { CreateTimeEntryAction } from "./actions/create";
import type {
  HardDeleteTimeEntryInput,
  HardDeleteTimeEntryOutput,
} from "./actions/hard-delete";
import { HardDeleteTimeEntryAction } from "./actions/hard-delete";
import type {
  ListTimeEntriesInput,
  ListTimeEntriesOutput,
} from "./actions/list";
import { ListTimeEntriesAction } from "./actions/list";
import type {
  PatchTimeEntryInput,
  PatchTimeEntryOutput,
} from "./actions/patch";
import { PatchTimeEntryAction } from "./actions/patch";
import type {
  RetrieveTimeEntryInput,
  RetrieveTimeEntryOutput,
} from "./actions/retrieve";
import { RetrieveTimeEntryAction } from "./actions/retrieve";
import { TimeEntryRepository } from "./repositories/time-entry.repo";

export class TimeModuleService extends Context.Tag(
  "@mason/time/TimeModuleService"
)<
  TimeModuleService,
  {
    createTimeEntry: (
      params: CreateTimeEntryInput
    ) => Effect.Effect<CreateTimeEntryOutput, MasonError>;
    patchTimeEntry: (
      params: PatchTimeEntryInput
    ) => Effect.Effect<PatchTimeEntryOutput, MasonError>;
    retrieveTimeEntry: (
      params: RetrieveTimeEntryInput
    ) => Effect.Effect<RetrieveTimeEntryOutput, MasonError>;
    listTimeEntries: (
      params: ListTimeEntriesInput
    ) => Effect.Effect<ListTimeEntriesOutput, MasonError>;
    hardDeleteTimeEntry: (
      params: HardDeleteTimeEntryInput
    ) => Effect.Effect<HardDeleteTimeEntryOutput, MasonError>;
  }
>() {
  static readonly live = Layer.effect(
    TimeModuleService,
    Effect.gen(function* () {
      const timeEntryRepo = yield* TimeEntryRepository;

      const services = Context.make(TimeEntryRepository, timeEntryRepo);

      return TimeModuleService.of({
        createTimeEntry: (params) =>
          CreateTimeEntryAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              "time/TimeEntryTransitionError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
              ParseError: (e) => Effect.fail(new MasonError({ cause: e })),
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),

        patchTimeEntry: (params) =>
          PatchTimeEntryAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              "time/TimeEntryTransitionError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
              ParseError: (e) => Effect.fail(new MasonError({ cause: e })),
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),

        retrieveTimeEntry: (params) =>
          RetrieveTimeEntryAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),
        listTimeEntries: (params) =>
          ListTimeEntriesAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),
        hardDeleteTimeEntry: (params) =>
          HardDeleteTimeEntryAction(params).pipe(
            Effect.provide(services),
            Effect.catchTags({
              "infra/DatabaseError": (e) =>
                Effect.fail(new MasonError({ cause: e })),
            })
          ),
      });
    })
  );
}
