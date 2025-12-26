import {
  ExistingTimeEntryId,
  ExistingWorkspaceId,
  processArray,
  TimeEntryId,
} from "@mason/framework";
import { Context, type DateTime, Effect, Layer } from "effect";
import type { ParseError } from "effect/ParseResult";
import type { TimeEntryToCreateDTO, TimeEntryToUpdateDTO } from "./dto";
import {
  InternalTimeTrackingModuleError,
  TimeEntryNotFoundError,
} from "./errors";
import {
  createTimeEntry,
  softDeleteTimeEntry,
  TimeEntry,
  updateTimeEntry,
} from "./time-entry.model";
import { TimeEntryRepository } from "./time-entry.repo";

export class TimeTrackingModuleService extends Context.Tag(
  "@mason/time-tracking/TimeTrackingModuleService"
)<
  TimeTrackingModuleService,
  {
    createTimeEntries: (params: {
      workspaceId: ExistingWorkspaceId;
      timeEntries: ReadonlyArray<TimeEntryToCreateDTO>;
    }) => Effect.Effect<
      ReadonlyArray<TimeEntry>,
      InternalTimeTrackingModuleError
    >;
    updateTimeEntries: (params: {
      workspaceId: ExistingWorkspaceId;
      timeEntries: ReadonlyArray<TimeEntryToUpdateDTO>;
    }) => Effect.Effect<
      ReadonlyArray<TimeEntry>,
      InternalTimeTrackingModuleError | TimeEntryNotFoundError
    >;
    softDeleteTimeEntries: (params: {
      workspaceId: ExistingWorkspaceId;
      timeEntryIds: ReadonlyArray<TimeEntryId>;
    }) => Effect.Effect<void, InternalTimeTrackingModuleError>;
    hardDeleteTimeEntries: (params: {
      workspaceId: ExistingWorkspaceId;
      timeEntryIds: ReadonlyArray<TimeEntryId>;
    }) => Effect.Effect<void, InternalTimeTrackingModuleError>;
    listTimeEntries: (params: {
      workspaceId: ExistingWorkspaceId;
      query?: {
        ids?: Array<TimeEntryId>;
        startedAt?: DateTime.Utc;
        stoppedAt?: DateTime.Utc;
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
            onEmpty: Effect.succeed([]),
            execute: (nea) =>
              Effect.gen(function* () {
                const timeEntriesToCreate = yield* Effect.forEach(
                  nea,
                  (timeEntry) =>
                    createTimeEntry({
                      ...timeEntry,
                      workspaceId: workspaceId,
                      taskId: timeEntry.taskId ?? null,
                    })
                );

                return yield* timeEntryRepo.insert(timeEntriesToCreate);
              }),
          }).pipe(
            Effect.catchTags({
              "@mason/framework/DatabaseError": (e) =>
                Effect.fail(new InternalTimeTrackingModuleError({ cause: e })),
              ParseError: (e: ParseError) =>
                Effect.fail(new InternalTimeTrackingModuleError({ cause: e })),
            })
          )
        ),
        updateTimeEntries: Effect.fn(
          "@mason/time-tracking/TimeTrackingModuleService.updateTimeEntries"
        )(({ workspaceId, timeEntries }) =>
          processArray({
            items: timeEntries,
            onEmpty: Effect.succeed([]),
            prepare: (updates) =>
              Effect.gen(function* () {
                const existingTimeEntries = yield* timeEntryRepo.list({
                  workspaceId: workspaceId,
                  query: {
                    ids: updates.map((timeEntry) => timeEntry.id),
                  },
                });

                return new Map(
                  existingTimeEntries.map((e) => [TimeEntryId.make(e.id), e])
                );
              }),
            mapItem: (update, existingMap) =>
              Effect.gen(function* () {
                const existing = existingMap.get(update.id);

                if (!existing) {
                  return yield* Effect.fail(
                    new TimeEntryNotFoundError({ timeEntryId: update.id })
                  );
                }
                const { id, ...patchData } = update;

                return yield* updateTimeEntry(existing, patchData);
              }),
            execute: (timeEntriesToUpdate) =>
              timeEntryRepo.update(timeEntriesToUpdate),
          }).pipe(
            Effect.catchTags({
              "@mason/framework/DatabaseError": (e) =>
                Effect.fail(new InternalTimeTrackingModuleError({ cause: e })),
              ParseError: (e: ParseError) =>
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
                  workspaceId: workspaceId,
                  query: {
                    ids: nea,
                  },
                });

                const deletedTimeEntries = yield* Effect.forEach(
                  existingTimeEntries,
                  softDeleteTimeEntry
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
              "@mason/framework/DatabaseError": (e) =>
                Effect.fail(new InternalTimeTrackingModuleError({ cause: e })),
              ParseError: (e: ParseError) =>
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
                  workspaceId: workspaceId,
                  query: {
                    ids: nea,
                  },
                });

                yield* processArray({
                  items: existingTimeEntries.map((existing) => existing.id),
                  schema: ExistingTimeEntryId,
                  onEmpty: Effect.void,
                  execute: (nea) => timeEntryRepo.hardDelete(nea),
                });
              }),
          }).pipe(
            Effect.catchTags({
              "@mason/framework/DatabaseError": (e) =>
                Effect.fail(new InternalTimeTrackingModuleError({ cause: e })),
              ParseError: (e: ParseError) =>
                Effect.fail(new InternalTimeTrackingModuleError({ cause: e })),
            })
          )
        ),
        listTimeEntries: Effect.fn(
          "@mason/time-tracking/TimeTrackingModuleService.listTimeEntries"
        )((params) => {
          const baseParams: {
            workspaceId: ReturnType<typeof ExistingWorkspaceId.make>;
            query?: {
              ids?: ReadonlyArray<TimeEntryId>;
              startedAt?: DateTime.Utc;
              stoppedAt?: DateTime.Utc;
            };
          } = {
            workspaceId: ExistingWorkspaceId.make(params.workspaceId),
          };

          if (params.query) {
            baseParams.query = {
              ...(params.query.ids && { ids: params.query.ids }),
              ...(params.query.startedAt && {
                startedAt: params.query.startedAt,
              }),
              ...(params.query.stoppedAt && {
                stoppedAt: params.query.stoppedAt,
              }),
            };
          }

          return timeEntryRepo
            .list(baseParams)
            .pipe(
              Effect.mapError(
                (e) => new InternalTimeTrackingModuleError({ cause: e })
              )
            );
        }),
      });
    })
  );
}
