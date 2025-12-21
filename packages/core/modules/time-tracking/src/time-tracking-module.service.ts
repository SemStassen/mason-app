import type {
  TimeEntryId,
  WorkspaceId,
} from "@mason/framework/types/ids";
import { Context, Effect, Layer } from "effect";
import type { TimeEntry } from "./models/time-entry.model";
import { TimeEntryRepository } from "./repositories/time-entry.repo";
import { GenericTimeTrackingModuleError, type TimeTrackingModuleError } from "./errors";

export class TimeTrackingModuleService extends Context.Tag(
  "@mason/time-tracking/TimeTrackingModuleService"
)<
  TimeTrackingModuleService,
  {
    createTimeEntries: (params: {
      workspaceId: WorkspaceId;
      timeEntries: Array<TimeEntry>;
    }) => Effect.Effect<readonly TimeEntry[], TimeTrackingModuleError>;
    updateTimeEntries: (params: {
      workspaceId: WorkspaceId;
      timeEntries: Array<TimeEntry>;
    }) => Effect.Effect<readonly TimeEntry[], TimeTrackingModuleError>;
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
    }) => Effect.Effect<readonly TimeEntry[], TimeTrackingModuleError>;
  }
>() {
  static readonly live = Layer.effect(
    TimeTrackingModuleService,
    Effect.gen(function* () {
      const timeEntryRepo = yield* TimeEntryRepository;

      return TimeTrackingModuleService.of({
        createTimeEntries: Effect.fn(
          "@mason/time-tracking/TimeTrackingModuleService.createTimeEntries"
        )((params) =>
          timeEntryRepo
            .insert(params)
            .pipe(
              Effect.mapError(
                (e) => new GenericTimeTrackingModuleError({ cause: e })
              )
            )
        ),
        updateTimeEntries: Effect.fn(
          "@mason/time-tracking/TimeTrackingModuleService.updateTimeEntries"
        )((params) =>
          timeEntryRepo
            .update(params)
            .pipe(
              Effect.mapError(
                (e) => new GenericTimeTrackingModuleError({ cause: e })
              )
            )
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
