import { SqlSchema } from "@effect/sql";
import { and, eq, gte, inArray, isNotNull, lte } from "@mason/db/operators";
import { type DbTimeEntry, timeEntriesTable } from "@mason/db/schema";
import { DatabaseService } from "@mason/db/service";
import {
  DatabaseError,
  ExistingTimeEntryId,
  ExistingWorkspaceId,
  TimeEntryId,
} from "@mason/framework";
import { Context, DateTime, Effect, Layer, Option, Schema } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import { TimeEntry } from "../domain";

const _mapToDb = (
  timeEntry: typeof TimeEntry.TimeEntry.Encoded
): Omit<DbTimeEntry, "createdAt" | "updatedAt"> => ({
  id: timeEntry.id,
  workspaceId: timeEntry.workspaceId,
  memberId: timeEntry.memberId,
  projectId: timeEntry.projectId,
  taskId: Option.getOrNull(timeEntry.taskId),
  startedAt: DateTime.toDate(timeEntry.startedAt),
  stoppedAt: DateTime.toDate(timeEntry.stoppedAt),
  notes: Option.getOrNull(timeEntry.notes),
  deletedAt: Option.getOrNull(Option.map(timeEntry.deletedAt, DateTime.toDate)),
});

export class TimeEntryRepository extends Context.Tag(
  "@mason/time-tracking/TimeEntryRepository"
)<
  TimeEntryRepository,
  {
    insert: (
      timeEntries: NonEmptyReadonlyArray<TimeEntry.TimeEntry>
    ) => Effect.Effect<ReadonlyArray<TimeEntry.TimeEntry>, DatabaseError>;
    update: (
      timeEntries: NonEmptyReadonlyArray<TimeEntry.TimeEntry>
    ) => Effect.Effect<ReadonlyArray<TimeEntry.TimeEntry>, DatabaseError>;
    hardDelete: (
      timeEntryIds: NonEmptyReadonlyArray<ExistingTimeEntryId>
    ) => Effect.Effect<void, DatabaseError>;
    list: (params: {
      workspaceId: ExistingWorkspaceId;
      query?: {
        ids?: ReadonlyArray<TimeEntryId>;
        startedAt?: DateTime.Utc;
        stoppedAt?: DateTime.Utc;
        _includeDeleted?: boolean;
      };
    }) => Effect.Effect<ReadonlyArray<TimeEntry.TimeEntry>, DatabaseError>;
  }
>() {
  static readonly live = Layer.effect(
    TimeEntryRepository,
    Effect.gen(function* () {
      const db = yield* DatabaseService;

      // --- Mutations / Commands ---
      const InsertTimeEntries = SqlSchema.findAll({
        Request: Schema.NonEmptyArray(TimeEntry.TimeEntry),
        Result: TimeEntry.TimeEntry,
        execute: (timeEntries) =>
          db.drizzle
            .insert(timeEntriesTable)
            .values(timeEntries.map(_mapToDb))
            .returning(),
      });

      const UpdateTimeEntries = SqlSchema.findAll({
        Request: Schema.NonEmptyArray(TimeEntry.TimeEntry),
        Result: TimeEntry.TimeEntry,
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
        Request: Schema.NonEmptyArray(ExistingTimeEntryId),
        execute: (timeEntryIds) =>
          db.drizzle
            .delete(timeEntriesTable)
            .where(inArray(timeEntriesTable.id, timeEntryIds)),
      });

      // --- Queries ---
      const ListTimeEntries = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: ExistingWorkspaceId,
          query: Schema.optional(
            Schema.Struct({
              ids: Schema.optional(Schema.Array(TimeEntryId)),
              startedAt: Schema.optional(Schema.DateTimeUtcFromSelf),
              stoppedAt: Schema.optional(Schema.DateTimeUtcFromSelf),
              _includeDeleted: Schema.optional(Schema.Boolean),
            })
          ),
        }),
        Result: TimeEntry.TimeEntry,
        execute: ({ workspaceId, query }) => {
          const whereConditions = [
            eq(timeEntriesTable.workspaceId, workspaceId),
            query?.ids ? inArray(timeEntriesTable.id, query.ids) : undefined,
            query?.startedAt
              ? gte(
                  timeEntriesTable.startedAt,
                  DateTime.toDate(query.startedAt)
                )
              : undefined,
            query?.stoppedAt
              ? lte(
                  timeEntriesTable.stoppedAt,
                  DateTime.toDate(query.stoppedAt)
                )
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
          (timeEntries) =>
            InsertTimeEntries(timeEntries).pipe(
              Effect.mapError((e) => new DatabaseError({ cause: e }))
            )
        ),

        update: Effect.fn("@mason/time-tracking/TimeEntryRepo.update")(
          (timeEntries) =>
            UpdateTimeEntries(timeEntries).pipe(
              Effect.mapError((e) => new DatabaseError({ cause: e }))
            )
        ),

        hardDelete: Effect.fn("@mason/time-tracking/TimeEntryRepo.hardDelete")(
          (timeEntryIds) =>
            HardDeleteTimeEntries(timeEntryIds).pipe(
              Effect.mapError((e) => new DatabaseError({ cause: e }))
            )
        ),

        list: Effect.fn("@mason/time-tracking/TimeEntryRepo.list")((params) =>
          ListTimeEntries(params).pipe(
            Effect.mapError((e) => new DatabaseError({ cause: e }))
          )
        ),
      });
    })
  );
}
