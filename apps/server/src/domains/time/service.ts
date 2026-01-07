import { Context, type DateTime, Effect, Layer } from "effect";
import { AuthorizationService } from "~/application/authorization";
import type { AuthorizationError } from "~/shared/errors/authorization";
import type { TimeEntryId, WorkspaceId } from "~/shared/schemas";
import { processArray } from "~/shared/utils";
import {
  TimeDomainError,
  TimeEntryFns,
  TimeEntryNotFoundError,
} from "./internal";
import { TimeEntryRepository } from "./repositories/time-entry.repo";
import type {
  CreateTimeEntryCommand,
  UpdateTimeEntryCommand,
} from "./schemas/commands";
import type { TimeEntry } from "./schemas/time-entry.model";

export class TimeDomainService extends Context.Tag(
  "@mason/time/TimeDomainService"
)<
  TimeDomainService,
  {
    createTimeEntries: (params: {
      workspaceId: WorkspaceId;
      commands: ReadonlyArray<CreateTimeEntryCommand>;
    }) => Effect.Effect<ReadonlyArray<TimeEntry>, TimeDomainError>;
    updateTimeEntries: (params: {
      workspaceId: WorkspaceId;
      commands: ReadonlyArray<UpdateTimeEntryCommand>;
    }) => Effect.Effect<
      ReadonlyArray<TimeEntry>,
      AuthorizationError | TimeDomainError | TimeEntryNotFoundError
    >;
    softDeleteTimeEntries: (params: {
      workspaceId: WorkspaceId;
      timeEntryIds: ReadonlyArray<TimeEntryId>;
    }) => Effect.Effect<
      void,
      AuthorizationError | TimeDomainError | TimeEntryNotFoundError
    >;
    listTimeEntries: (params: {
      workspaceId: WorkspaceId;
      query?: {
        ids?: Array<TimeEntryId>;
        startedAt?: DateTime.Utc;
        stoppedAt?: DateTime.Utc;
      };
    }) => Effect.Effect<ReadonlyArray<TimeEntry>, TimeDomainError>;
  }
>() {
  static readonly live = Layer.effect(
    TimeDomainService,
    Effect.gen(function* () {
      const authorization = yield* AuthorizationService;
      const timeEntryRepo = yield* TimeEntryRepository;

      return TimeDomainService.of({
        createTimeEntries: Effect.fn(
          "time/TimeDomainService.createTimeEntries"
        )(({ workspaceId, commands }) =>
          processArray({
            items: commands,
            onEmpty: Effect.succeed([]),
            mapItem: (timeEntry) =>
              TimeEntryFns.create(timeEntry, {
                workspaceId,
              }),
            execute: (timeEntries) =>
              timeEntryRepo.insert({ workspaceId, timeEntries }),
          }).pipe(
            Effect.catchTags({
              "shared/DatabaseError": (e) =>
                Effect.fail(new TimeDomainError({ cause: e })),
              ParseError: (e) => Effect.fail(new TimeDomainError({ cause: e })),
            })
          )
        ),
        updateTimeEntries: Effect.fn(
          "time/TimeDomainService.updateTimeEntries"
        )(({ workspaceId, commands }) =>
          processArray({
            items: commands,
            onEmpty: Effect.succeed([]),
            prepare: (updates) =>
              Effect.gen(function* () {
                const existingTimeEntries = yield* timeEntryRepo.list({
                  workspaceId,
                  query: { ids: updates.map((t) => t.timeEntryId) },
                });

                yield* authorization.ensureWorkspaceMatches({
                  workspaceId,
                  model: existingTimeEntries,
                });

                return new Map(existingTimeEntries.map((e) => [e.id, e]));
              }),
            mapItem: (update, existingMap) =>
              Effect.gen(function* () {
                const existing = existingMap.get(update.timeEntryId);

                if (!existing) {
                  return yield* Effect.fail(new TimeEntryNotFoundError());
                }

                return yield* TimeEntryFns.update(existing, update);
              }),
            execute: (timeEntriesToUpdate) =>
              timeEntryRepo.update({
                workspaceId,
                timeEntries: timeEntriesToUpdate,
              }),
          }).pipe(
            Effect.catchTags({
              "shared/DatabaseError": (e) =>
                Effect.fail(new TimeDomainError({ cause: e })),
              ParseError: (e) => Effect.fail(new TimeDomainError({ cause: e })),
            })
          )
        ),
        softDeleteTimeEntries: Effect.fn(
          "time/TimeDomainService.softDeleteTimeEntries"
        )(({ workspaceId, timeEntryIds }) =>
          processArray({
            items: timeEntryIds,
            onEmpty: Effect.void,
            prepare: (timeEntryIds) =>
              Effect.gen(function* () {
                const existingTimeEntries = yield* timeEntryRepo.list({
                  workspaceId,
                  query: { ids: timeEntryIds },
                });

                yield* authorization.ensureWorkspaceMatches({
                  workspaceId,
                  model: existingTimeEntries,
                });

                return new Map(existingTimeEntries.map((e) => [e.id, e]));
              }),
            mapItem: (timeEntryId, existingMap) =>
              Effect.gen(function* () {
                const existing = existingMap.get(timeEntryId);

                if (!existing) {
                  return yield* Effect.fail(new TimeEntryNotFoundError());
                }

                return yield* TimeEntryFns.softDelete(existing).pipe(
                  Effect.map((t) => t.id)
                );
              }),
            execute: (timeEntryIdsToSoftDelete) =>
              timeEntryRepo.softDelete({
                timeEntryIds: timeEntryIdsToSoftDelete,
              }),
          }).pipe(
            Effect.catchTags({
              "shared/DatabaseError": (e) =>
                Effect.fail(new TimeDomainError({ cause: e })),
              ParseError: (e) => Effect.fail(new TimeDomainError({ cause: e })),
            })
          )
        ),
        listTimeEntries: Effect.fn("time/TimeDomainService.listTimeEntries")(
          ({ workspaceId, query }) =>
            timeEntryRepo
              .list({
                workspaceId,
                query: { ...query, _includeDeleted: false },
              })
              .pipe(
                Effect.catchTags({
                  "shared/DatabaseError": (e) =>
                    Effect.fail(new TimeDomainError({ cause: e })),
                })
              )
        ),
      });
    })
  );
}
