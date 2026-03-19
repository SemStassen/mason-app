import { DateTime, Effect, Layer, Option } from "effect";

import { TimeEntryAlreadyRunningError } from "./domain/time-entry.errors";
import * as timeEntryTransitions from "./domain/time-entry.transitions";
import { TimeEntryRepository } from "./time-entry-repository.service";
import { TimeEntryNotFoundError, TimeModule } from "./time-module.service";

export const TimeModuleLayer = Layer.effect(
  TimeModule,
  Effect.gen(function* () {
    const timeEntryRepo = yield* TimeEntryRepository;

    return {
      createTimeEntries: Effect.fn("time.createTimeEntries")(
        function* (params) {
          if (params.data.length === 0) {
            return [];
          }

          const now = yield* DateTime.now;
          const timeEntries = yield* Effect.forEach(params.data, (data) =>
            Effect.fromResult(
              timeEntryTransitions.createTimeEntry({
                workspaceId: params.workspaceId,
                workspaceMemberId: params.workspaceMemberId,
                data,
                now,
              })
            )
          );

          const runningEntries = timeEntries.filter((e) => e.isRunning());

          if (runningEntries.length > 1) {
            return yield* new TimeEntryAlreadyRunningError();
          }

          if (runningEntries.length === 1) {
            const otherRunning =
              yield* timeEntryRepo.findRunningByWorkspaceMember({
                workspaceId: params.workspaceId,
                workspaceMemberId: params.workspaceMemberId,
              });

            if (Option.isSome(otherRunning)) {
              return yield* new TimeEntryAlreadyRunningError();
            }
          }

          const persistedTimeEntries =
            yield* timeEntryRepo.insertMany(timeEntries);

          return persistedTimeEntries;
        }
      ),
      updateTimeEntry: Effect.fn("time.updateTimeEntry")(function* (params) {
        const timeEntry = yield* timeEntryRepo
          .findById({ workspaceId: params.workspaceId, id: params.id })
          .pipe(
            Effect.flatMap(
              Option.match({
                onNone: () =>
                  Effect.fail(
                    new TimeEntryNotFoundError({
                      timeEntryId: params.id,
                    })
                  ),
                onSome: Effect.succeed,
              })
            )
          );

        const { entity, changes } = yield* Effect.fromResult(
          timeEntryTransitions.updateTimeEntry({
            timeEntry,
            data: params.data,
          })
        );

        if (entity.isRunning()) {
          const otherRunning = yield* timeEntryRepo
            .findRunningByWorkspaceMember({
              workspaceId: params.workspaceId,
              workspaceMemberId: entity.workspaceMemberId,
            })
            .pipe(Effect.map(Option.filter((e) => e.id !== params.id)));

          if (Option.isSome(otherRunning)) {
            return yield* new TimeEntryAlreadyRunningError();
          }
        }

        const persistedTimeEntry = yield* timeEntryRepo.update({
          id: entity.id,
          workspaceId: entity.workspaceId,
          update: changes,
        });

        return persistedTimeEntry;
      }),
      hardDeleteTimeEntries: Effect.fn("time.hardDeleteTimeEntries")(
        function* (params) {
          if (params.ids.length === 0) {
            return;
          }

          yield* timeEntryRepo.hardDeleteMany({
            workspaceId: params.workspaceId,
            ids: params.ids,
          });
        }
      ),
    };
  })
);
