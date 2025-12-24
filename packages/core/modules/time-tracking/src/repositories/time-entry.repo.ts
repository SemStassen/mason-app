import { SqlSchema } from "@effect/sql";
import { and, eq, gte, inArray, isNotNull, lte } from "@mason/db/operators";
import { type DbTimeEntry, timeEntriesTable } from "@mason/db/schema";
import { DatabaseService } from "@mason/db/service";
import {
  type RepositoryError,
  TimeEntryId,
  WorkspaceId,
} from "@mason/framework";
import { Context, Effect, Layer, Schema } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import { TimeEntry } from "../models/time-entry.model";

const _mapToDb = (
  timeEntry: typeof TimeEntry.Encoded
): Omit<DbTimeEntry, "createdAt" | "updatedAt"> => {
  return {
    id: timeEntry.id,
    workspaceId: timeEntry.workspaceId,
    memberId: timeEntry.memberId,
    projectId: timeEntry.projectId,
    taskId: timeEntry.taskId,
    startedAt: timeEntry.startedAt,
    stoppedAt: timeEntry.stoppedAt,
    notes: timeEntry.notes,
    deletedAt: timeEntry.deletedAt,
  };
};

export class TimeEntryRepository extends Context.Tag(
  "@mason/time-tracking/TimeEntryRepository"
)<
  TimeEntryRepository,
  {
    insert: (
      timeEntries: NonEmptyReadonlyArray<TimeEntry>
    ) => Effect.Effect<ReadonlyArray<TimeEntry>, RepositoryError>;
    update: (
      timeEntries: NonEmptyReadonlyArray<TimeEntry>
    ) => Effect.Effect<ReadonlyArray<TimeEntry>, RepositoryError>;
    hardDelete: (
      timeEntryIds: NonEmptyReadonlyArray<TimeEntryId>
    ) => Effect.Effect<void, RepositoryError>;
    list: (params: {
      workspaceId: WorkspaceId;
      query?: {
        ids?: ReadonlyArray<TimeEntryId>;
        startedAt?: Date;
        stoppedAt?: Date;
        _includeDeleted?: boolean;
      };
    }) => Effect.Effect<ReadonlyArray<TimeEntry>, RepositoryError>;
  }
>() {
  static readonly live = Layer.effect(
    TimeEntryRepository,
    Effect.gen(function* () {
      const db = yield* DatabaseService;

      // --- Mutations / Commands ---
      const InsertTimeEntries = SqlSchema.findAll({
        Request: Schema.NonEmptyArray(TimeEntry),
        Result: TimeEntry,
        execute: (timeEntries) =>
          db.drizzle
            .insert(timeEntriesTable)
            .values(timeEntries.map(_mapToDb))
            .returning(),
      });

      const UpdateTimeEntries = SqlSchema.findAll({
        Request: Schema.NonEmptyArray(TimeEntry),
        Result: TimeEntry,
        execute: (timeEntries) =>
          Effect.forEach(
            timeEntries,
            (timeEntry) =>
              db.drizzle
                .update(timeEntriesTable)
                .set(_mapToDb(timeEntry))
                .where(eq(timeEntriesTable.id, timeEntry.id))
                .returning(),
            { concurrency: 5 }
          ).pipe(Effect.map((r) => r.flat())),
      });

      const HardDeleteTimeEntries = SqlSchema.void({
        Request: Schema.NonEmptyArray(TimeEntryId),
        execute: (timeEntryIds) =>
          db.drizzle
            .delete(timeEntriesTable)
            .where(inArray(timeEntriesTable.id, timeEntryIds)),
      });

      // --- Queries ---
      const ListTimeEntries = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: WorkspaceId,
          query: Schema.optional(
            Schema.Struct({
              ids: Schema.optional(Schema.Array(TimeEntryId)),
              startedAt: Schema.optional(Schema.DateFromSelf),
              stoppedAt: Schema.optional(Schema.DateFromSelf),
              _includeDeleted: Schema.optional(Schema.Boolean),
            })
          ),
        }),
        Result: TimeEntry,
        execute: ({ workspaceId, query }) => {
          const whereConditions = [
            eq(timeEntriesTable.workspaceId, workspaceId),
            query?.ids ? inArray(timeEntriesTable.id, query.ids) : undefined,
            query?.startedAt
              ? gte(timeEntriesTable.startedAt, query.startedAt)
              : undefined,
            query?.stoppedAt
              ? lte(timeEntriesTable.stoppedAt, query.stoppedAt)
              : undefined,
            query?._includeDeleted
              ? undefined
              : isNotNull(timeEntriesTable.deletedAt),
          ].filter(Boolean);

          return db.drizzle.query.timeEntriesTable.findMany({
            where: and(...whereConditions),
          });
        },
      });

      return TimeEntryRepository.of({
        insert: Effect.fn("@mason/time-tracking/TimeEntryRepo.insert")(
          (timeEntries) => InsertTimeEntries(timeEntries)
        ),

        update: Effect.fn("@mason/time-tracking/TimeEntryRepo.update")(
          (timeEntries) => UpdateTimeEntries(timeEntries)
        ),

        hardDelete: Effect.fn("@mason/time-tracking/TimeEntryRepo.hardDelete")(
          (timeEntryIds) => HardDeleteTimeEntries(timeEntryIds)
        ),

        list: Effect.fn("@mason/time-tracking/TimeEntryRepo.list")((params) =>
          ListTimeEntries(params)
        ),
      });
    })
  );
}
