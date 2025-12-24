import { processArray, TimeEntryId, type WorkspaceId } from "@mason/framework";
import { Context, Effect, Layer } from "effect";
import { TimeEntryToCreate, TimeEntryToUpdate } from "./dto";
import {
  InternalTimeTrackingModuleError,
  TimeEntryNotFoundError,
} from "./errors";
import { TimeEntry } from "./models/time-entry.model";
import { TimeEntryRepository } from "./repositories/time-entry.repo";

export class TimeTrackingModuleService extends Context.Tag(
  "@mason/time-tracking/TimeTrackingModuleService"
)<
  TimeTrackingModuleService,
  {
    createTimeEntries: (params: {
      workspaceId: WorkspaceId;
      timeEntries: ReadonlyArray<TimeEntryToCreate>;
    }) => Effect.Effect<
      ReadonlyArray<TimeEntry>,
      InternalTimeTrackingModuleError
    >;
    updateTimeEntries: (params: {
      workspaceId: WorkspaceId;
      timeEntries: ReadonlyArray<TimeEntryToUpdate>;
    }) => Effect.Effect<
      ReadonlyArray<TimeEntry>,
      InternalTimeTrackingModuleError | TimeEntryNotFoundError
    >;
    softDeleteTimeEntries: (params: {
      workspaceId: WorkspaceId;
      timeEntryIds: ReadonlyArray<TimeEntryId>;
    }) => Effect.Effect<void, InternalTimeTrackingModuleError>;
    hardDeleteTimeEntries: (params: {
      workspaceId: WorkspaceId;
      timeEntryIds: ReadonlyArray<TimeEntryId>;
    }) => Effect.Effect<void, InternalTimeTrackingModuleError>;
    listTimeEntries: (params: {
      workspaceId: WorkspaceId;
      query?: {
        ids?: Array<TimeEntryId>;
        startedAt?: Date;
        stoppedAt?: Date;
      };
    }) => Effect.Effect<
      ReadonlyArray<TimeEntry>,
      InternalTimeTrackingModuleError
    >;
  }
>() {
  static readonly live = Layer.effect(
    TimeTrackingModuleService,
    Effect.gen(function* () {
      const timeEntryRepo = yield* TimeEntryRepository;

      return TimeTrackingModuleService.of({
        createTimeEntries: Effect.fn(
          "@mason/time-tracking/TimeTrackingModuleService.createTimeEntries"
        )(({ workspaceId, timeEntries }) =>
          processArray({
            items: timeEntries,
            schema: TimeEntryToCreate,
            onEmpty: Effect.succeed([]),
            execute: (nea) =>
              Effect.gen(function* () {
                const timeEntriesToCreate = yield* Effect.forEach(
                  nea,
                  (timeEntry) =>
                    TimeEntry.makeFromCreate(workspaceId, timeEntry)
                );

                return yield* timeEntryRepo.insert(timeEntriesToCreate);
              }),
          }).pipe(
            Effect.catchTags({
              ParseError: (e) =>
                Effect.fail(new InternalTimeTrackingModuleError({ cause: e })),
              SqlError: (e) =>
                Effect.fail(new InternalTimeTrackingModuleError({ cause: e })),
            })
          )
        ),
        updateTimeEntries: Effect.fn(
          "@mason/time-tracking/TimeTrackingModuleService.updateTimeEntries"
        )(({ workspaceId, timeEntries }) =>
          processArray({
            items: timeEntries,
            schema: TimeEntryToUpdate,
            onEmpty: Effect.succeed([]),
            prepare: (updates) =>
              Effect.gen(function* () {
                const existingTimeEntries = yield* timeEntryRepo.list({
                  workspaceId,
                  query: {
                    ids: updates.map((timeEntry) => timeEntry.id),
                  },
                });
                return new Map(existingTimeEntries.map((e) => [e.id, e]));
              }),
            mapItem: (update, existingMap) =>
              Effect.gen(function* () {
                const existing = existingMap.get(update.id);
                if (!existing) {
                  return yield* Effect.fail(
                    new TimeEntryNotFoundError({ timeEntryId: update.id })
                  );
                }
                return yield* existing.patch(update);
              }),
            execute: (timeEntriesToUpdate) =>
              timeEntryRepo.update(timeEntriesToUpdate),
          }).pipe(
            Effect.catchTags({
              ParseError: (e) =>
                Effect.fail(new InternalTimeTrackingModuleError({ cause: e })),
              SqlError: (e) =>
                Effect.fail(new InternalTimeTrackingModuleError({ cause: e })),
            })
          )
        ),
        softDeleteTimeEntries: Effect.fn(
          "@mason/time-tracking/TimeTrackingModuleService.softDeleteTimeEntries"
        )(({ workspaceId, timeEntryIds }) =>
          processArray({
            items: timeEntryIds,
            schema: TimeEntryId,
            onEmpty: Effect.void,
            execute: (nea) =>
              Effect.gen(function* () {
                const existingTimeEntries = yield* timeEntryRepo.list({
                  workspaceId,
                  query: {
                    ids: nea,
                  },
                });

                const deletedTimeEntries = existingTimeEntries.map((existing) =>
                  existing.softDelete()
                );

                yield* processArray({
                  items: deletedTimeEntries,
                  schema: TimeEntry,
                  onEmpty: Effect.void,
                  execute: (nea) =>
                    timeEntryRepo.update(nea).pipe(Effect.asVoid),
                });
              }),
          }).pipe(
            Effect.catchTags({
              ParseError: (e) =>
                Effect.fail(new InternalTimeTrackingModuleError({ cause: e })),
              SqlError: (e) =>
                Effect.fail(new InternalTimeTrackingModuleError({ cause: e })),
            })
          )
        ),
        hardDeleteTimeEntries: Effect.fn(
          "@mason/time-tracking/TimeTrackingModuleService.hardDeleteTimeEntries"
        )(({ workspaceId, timeEntryIds }) =>
          processArray({
            items: timeEntryIds,
            schema: TimeEntryId,
            onEmpty: Effect.void,
            execute: (nea) =>
              Effect.gen(function* () {
                const existingTimeEntries = yield* timeEntryRepo.list({
                  workspaceId,
                  query: {
                    ids: nea,
                  },
                });

                yield* processArray({
                  items: existingTimeEntries.map((existing) => existing.id),
                  schema: TimeEntryId,
                  onEmpty: Effect.void,
                  execute: (nea) => timeEntryRepo.hardDelete(nea),
                });
              }),
          }).pipe(
            Effect.catchTags({
              ParseError: (e) =>
                Effect.fail(new InternalTimeTrackingModuleError({ cause: e })),
              SqlError: (e) =>
                Effect.fail(new InternalTimeTrackingModuleError({ cause: e })),
            })
          )
        ),
        listTimeEntries: Effect.fn(
          "@mason/time-tracking/TimeTrackingModuleService.listTimeEntries"
        )((params) =>
          timeEntryRepo
            .list(params)
            .pipe(
              Effect.mapError(
                (e) => new InternalTimeTrackingModuleError({ cause: e })
              )
            )
        ),
      });
    })
  );
}
