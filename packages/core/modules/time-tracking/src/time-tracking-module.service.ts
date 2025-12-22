import type { TimeEntryId, WorkspaceId } from "@mason/framework/types/ids";
import { Context, Effect, Layer } from "effect";
import type { TimeEntryToCreate, TimeEntryToUpdate } from "./dto";
import {
  GenericTimeTrackingModuleError,
  type TimeTrackingModuleError,
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
      timeEntries: Array<TimeEntryToCreate>;
    }) => Effect.Effect<ReadonlyArray<TimeEntry>, TimeTrackingModuleError>;
    updateTimeEntries: (params: {
      workspaceId: WorkspaceId;
      timeEntries: Array<TimeEntryToUpdate>;
    }) => Effect.Effect<ReadonlyArray<TimeEntry>, TimeTrackingModuleError>;
    softDeleteTimeEntries: (params: {
      workspaceId: WorkspaceId;
      timeEntryIds: Array<TimeEntryId>;
    }) => Effect.Effect<void, TimeTrackingModuleError>;
    hardDeleteTimeEntries: (params: {
      workspaceId: WorkspaceId;
      timeEntryIds: Array<TimeEntryId>;
    }) => Effect.Effect<void, TimeTrackingModuleError>;
    listTimeEntries: (params: {
      workspaceId: WorkspaceId;
      query?: {
        ids?: Array<TimeEntryId>;
        startedAt?: Date;
        stoppedAt?: Date;
      };
    }) => Effect.Effect<ReadonlyArray<TimeEntry>, TimeTrackingModuleError>;
  }
>() {
  static readonly live = Layer.effect(
    TimeTrackingModuleService,
    Effect.gen(function* () {
      const timeEntryRepo = yield* TimeEntryRepository;

      return TimeTrackingModuleService.of({
        createTimeEntries: Effect.fn(
          "@mason/time-tracking/TimeTrackingModuleService.createTimeEntries"
        )(
          function* (params) {
            const timeEntriesToCreate = yield* Effect.forEach(
              params.timeEntries,
              (timeEntry) =>
                TimeEntry.makeFromCreate(timeEntry, params.workspaceId)
            );
            return yield* timeEntryRepo.insert({
              workspaceId: params.workspaceId,
              timeEntries: timeEntriesToCreate,
            });
          },
          Effect.catchTags({
            ParseError: (e) =>
              Effect.fail(new GenericTimeTrackingModuleError({ cause: e })),
            SqlError: (e) =>
              Effect.fail(new GenericTimeTrackingModuleError({ cause: e })),
          })
        ),
        updateTimeEntries: Effect.fn(
          "@mason/time-tracking/TimeTrackingModuleService.updateTimeEntries"
        )(
          function* (params) {
            const existingTimeEntries = yield* timeEntryRepo.list({
              workspaceId: params.workspaceId,
              query: {
                ids: params.timeEntries.map((timeEntry) => timeEntry.id),
              },
            });

            const timeEntriesToUpdate = yield* Effect.forEach(
              params.timeEntries,
              (timeEntry) =>
                Effect.gen(function* () {
                  const existingTimeEntry = existingTimeEntries.find(
                    (t) => t.id === timeEntry.id
                  );
                  if (!existingTimeEntry) {
                    return yield* Effect.fail(
                      new GenericTimeTrackingModuleError({
                        cause: `Time entry ${timeEntry.id} not found`,
                      })
                    );
                  }
                  return yield* existingTimeEntry.patch(timeEntry);
                })
            );

            return yield* timeEntryRepo.update({
              workspaceId: params.workspaceId,
              timeEntries: timeEntriesToUpdate,
            });
          },
          Effect.catchTags({
            ParseError: (e) =>
              Effect.fail(new GenericTimeTrackingModuleError({ cause: e })),
            SqlError: (e) =>
              Effect.fail(new GenericTimeTrackingModuleError({ cause: e })),
          })
        ),
        softDeleteTimeEntries: Effect.fn(
          "@mason/time-tracking/TimeTrackingModuleService.softDeleteTimeEntries"
        )((params) =>
          timeEntryRepo
            .softDelete(params)
            .pipe(
              Effect.mapError(
                (e) => new GenericTimeTrackingModuleError({ cause: e })
              )
            )
        ),
        hardDeleteTimeEntries: Effect.fn(
          "@mason/time-tracking/TimeTrackingModuleService.hardDeleteTimeEntries"
        )((params) =>
          timeEntryRepo
            .hardDelete(params)
            .pipe(
              Effect.mapError(
                (e) => new GenericTimeTrackingModuleError({ cause: e })
              )
            )
        ),
        listTimeEntries: Effect.fn(
          "@mason/time-tracking/TimeTrackingModuleService.listTimeEntries"
        )((params) =>
          timeEntryRepo
            .list(params)
            .pipe(
              Effect.mapError(
                (e) => new GenericTimeTrackingModuleError({ cause: e })
              )
            )
        ),
      });
    })
  );
}
