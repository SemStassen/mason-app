import { SqlSchema } from "@effect/sql";
import { and, eq, gte, inArray, lte } from "@mason/db/operators";
import { timeEntriesTable } from "@mason/db/schema";
import { DatabaseService } from "@mason/db/service";
import type { RepositoryError } from "@mason/framework/errors/database";
import { TimeEntryId, WorkspaceId } from "@mason/framework/types";
import { Context, Effect, Layer, Schema } from "effect";
import { TimeEntry } from "../models/time-entry.model";

export class TimeEntryRepository extends Context.Tag(
  "@mason/time-tracking/TimeEntryRepository"
)<
  TimeEntryRepository,
  {
    insert: (params: {
      workspaceId: WorkspaceId;
      timeEntries: Array<TimeEntry>;
    }) => Effect.Effect<ReadonlyArray<TimeEntry>, RepositoryError>;
    update: (params: {
      workspaceId: WorkspaceId;
      timeEntries: Array<TimeEntry>;
    }) => Effect.Effect<ReadonlyArray<TimeEntry>, RepositoryError>;
    softDelete: (params: {
      workspaceId: WorkspaceId;
      timeEntryIds: Array<TimeEntryId>;
    }) => Effect.Effect<void, RepositoryError>;
    hardDelete: (params: {
      workspaceId: WorkspaceId;
      timeEntryIds: Array<TimeEntryId>;
    }) => Effect.Effect<void, RepositoryError>;
    list: (params: {
      workspaceId: WorkspaceId;
      query?: {
        ids?: Array<TimeEntryId>;
        startedAt?: Date;
        stoppedAt?: Date;
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
        Request: Schema.Struct({
          workspaceId: WorkspaceId,
          timeEntries: Schema.Array(TimeEntry),
        }),
        Result: TimeEntry,
        execute: ({ workspaceId, timeEntries }) =>
          db.drizzle
            .insert(timeEntriesTable)
            .values(
              timeEntries.map((timeEntry) => ({ ...timeEntry, workspaceId }))
            )
            .returning(),
      });

      const UpdateTimeEntries = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: WorkspaceId,
          timeEntries: Schema.Array(TimeEntry),
        }),
        Result: TimeEntry,
        execute: ({ workspaceId, timeEntries }) =>
          Effect.forEach(
            timeEntries,
            (timeEntry) =>
              db.drizzle
                .update(timeEntriesTable)
                .set(timeEntry)
                .where(
                  and(
                    eq(timeEntriesTable.workspaceId, workspaceId),
                    eq(timeEntriesTable.id, timeEntry.id)
                  )
                )
                .returning(),
            { concurrency: 5 }
          ),
      });

      const SoftDeleteTimeEntries = SqlSchema.void({
        Request: Schema.Struct({
          workspaceId: WorkspaceId,
          timeEntryIds: Schema.Array(TimeEntryId),
        }),
        execute: ({ workspaceId, timeEntryIds }) =>
          db.drizzle
            .update(timeEntriesTable)
            .set({ deletedAt: new Date() })
            .where(
              and(
                eq(timeEntriesTable.workspaceId, workspaceId),
                inArray(timeEntriesTable.id, timeEntryIds)
              )
            ),
      });

      const HardDeleteTimeEntries = SqlSchema.void({
        Request: Schema.Struct({
          workspaceId: WorkspaceId,
          timeEntryIds: Schema.Array(TimeEntryId),
        }),
        execute: ({ workspaceId, timeEntryIds }) =>
          db.drizzle
            .delete(timeEntriesTable)
            .where(
              and(
                eq(timeEntriesTable.workspaceId, workspaceId),
                inArray(timeEntriesTable.id, timeEntryIds)
              )
            ),
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
          ].filter(Boolean);

          return db.drizzle.query.timeEntriesTable.findMany({
            where: and(...whereConditions),
          });
        },
      });

      return TimeEntryRepository.of({
        insert: Effect.fn("@mason/time-tracking/TimeEntryRepo.insert")(
          ({ workspaceId, timeEntries }) =>
            db.withWorkspace(
              workspaceId,
              InsertTimeEntries({ workspaceId, timeEntries })
            )
        ),

        update: Effect.fn("@mason/time-tracking/TimeEntryRepo.update")(
          ({ workspaceId, timeEntries }) =>
            db.withWorkspace(
              workspaceId,
              UpdateTimeEntries({ workspaceId, timeEntries })
            )
        ),

        softDelete: Effect.fn("@mason/time-tracking/TimeEntryRepo.softDelete")(
          ({ workspaceId, timeEntryIds }) =>
            db.withWorkspace(
              workspaceId,
              SoftDeleteTimeEntries({ workspaceId, timeEntryIds })
            )
        ),

        hardDelete: Effect.fn("@mason/time-tracking/TimeEntryRepo.hardDelete")(
          ({ workspaceId, timeEntryIds }) =>
            db.withWorkspace(
              workspaceId,
              HardDeleteTimeEntries({ workspaceId, timeEntryIds })
            )
        ),

        list: Effect.fn("@mason/time-tracking/TimeEntryRepo.list")(
          ({ workspaceId, query }) =>
            db.withWorkspace(
              workspaceId,
              ListTimeEntries({ workspaceId, query })
            )
        ),
      });
    })
  );
}
