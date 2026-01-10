import { Array, Context, type DateTime, Effect, Layer } from "effect";
import {
  type AuthorizationError,
  AuthorizationService,
} from "~/infra/authorization";
import type { TimeEntryId, WorkspaceId } from "~/shared/schemas";
import { TimeDomainError, TimeEntryFns } from "./internal";
import { TimeEntryRepository } from "./repositories/time-entry.repo";
import type {
  CreateTimeEntryCommand,
  PatchTimeEntryCommand,
} from "./schemas/commands";
import type { TimeEntry } from "./schemas/time-entry.model";

export class TimeDomainService extends Context.Tag(
  "@mason/time/TimeDomainService"
)<
  TimeDomainService,
  {
    makeTimeEntry: (params: {
      workspaceId: WorkspaceId;
      command: CreateTimeEntryCommand;
    }) => Effect.Effect<TimeEntry, TimeDomainError>;
    patchTimeEntry: (params: {
      existing: TimeEntry;
      command: PatchTimeEntryCommand;
    }) => Effect.Effect<TimeEntry, TimeDomainError>;
    markTimeEntryAsDeleted: (params: {
      existing: TimeEntry;
    }) => Effect.Effect<TimeEntry, TimeDomainError>;
    saveTimeEntries: (params: {
      workspaceId: WorkspaceId;
      existing: ReadonlyArray<TimeEntry>;
    }) => Effect.Effect<void, AuthorizationError | TimeDomainError>;
    listTimeEntries: (params: {
      workspaceId: WorkspaceId;
      query?: {
        ids?: Array<TimeEntryId>;
        startedAt?: DateTime.Utc;
        stoppedAt?: DateTime.Utc;
      };
    }) => Effect.Effect<
      ReadonlyArray<TimeEntry>,
      AuthorizationError | TimeDomainError
    >;
  }
>() {
  static readonly live = Layer.effect(
    TimeDomainService,
    Effect.gen(function* () {
      const authorization = yield* AuthorizationService;
      const timeEntryRepo = yield* TimeEntryRepository;

      return TimeDomainService.of({
        makeTimeEntry: ({ workspaceId, command }) =>
          TimeEntryFns.create(command, { workspaceId }),

        patchTimeEntry: ({ existing, command }) =>
          TimeEntryFns.patch(existing, command),

        markTimeEntryAsDeleted: ({ existing }) =>
          TimeEntryFns.softDelete(existing),

        saveTimeEntries: Effect.fn("time/TimeDomainService.saveTimeEntries")(
          function* ({ workspaceId, existing }) {
            if (Array.isNonEmptyReadonlyArray(existing)) {
              yield* authorization.ensureWorkspaceMatches({
                workspaceId,
                model: existing,
              });

              yield* timeEntryRepo.upsert({
                workspaceId,
                timeEntries: existing,
              });
            }
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new TimeDomainError({ cause: e })),
          })
        ),

        listTimeEntries: Effect.fn("time/TimeDomainService.listTimeEntries")(
          function* ({ workspaceId, query }) {
            const timeEntries = yield* timeEntryRepo.list({
              workspaceId,
              query: { ...query, _includeDeleted: false },
            });

            yield* authorization.ensureWorkspaceMatches({
              workspaceId,
              model: timeEntries,
            });

            return timeEntries;
          },
          Effect.catchTags({
            "shared/DatabaseError": (e) =>
              Effect.fail(new TimeDomainError({ cause: e })),
          })
        ),
      });
    })
  );
}
