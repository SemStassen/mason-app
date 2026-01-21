import { SqlSchema } from "@effect/sql";
import { DrizzleService, schema } from "@mason/db";
import { and, eq, gte, inArray, lte, type SQL } from "drizzle-orm";
import { Context, DateTime, Effect, Layer, Option, Schema } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/infra/db";
import { wrapSqlError } from "~/infra/db";
import type { TimeEntryId, WorkspaceId } from "~/shared/schemas";
import { TimeEntry } from "../domain";

/**
 * Schema representing a database row from the time_entries table.
 * Includes all fields including metadata (createdAt, updatedAt).
 */
const TimeEntryDbRow = Schema.Struct({
  id: Schema.String,
  workspaceId: Schema.String,
  memberId: Schema.String,
  projectId: Schema.String,
  taskId: Schema.NullOr(Schema.String),
  startedAt: Schema.Date,
  stoppedAt: Schema.NullOr(Schema.Date),
  notes: Schema.NullOr(
    Schema.Record({ key: Schema.String, value: Schema.Unknown })
  ),
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
});
type TimeEntryDbRow = typeof TimeEntryDbRow.Type;

/**
 * Convert database row to TimeEntry domain entity.
 * Pure function - no Effect wrapping needed.
 */
const rowToTimeEntry = (row: TimeEntryDbRow): TimeEntry =>
  Schema.decodeUnknownSync(TimeEntry)({
    id: row.id,
    workspaceId: row.workspaceId,
    memberId: row.memberId,
    projectId: row.projectId,
    taskId: Option.fromNullable(row.taskId),
    startedAt: row.startedAt,
    stoppedAt: row.stoppedAt,
    notes: Option.fromNullable(row.notes),
  });

/**
 * Maps domain model to database format (DateTime.Utc -> Date, Option<T> -> T | null).
 */
const timeEntryToDb = (timeEntry: typeof TimeEntry.Encoded) => ({
  id: timeEntry.id,
  workspaceId: timeEntry.workspaceId,
  memberId: timeEntry.memberId,
  projectId: timeEntry.projectId,
  taskId: Option.getOrNull(timeEntry.taskId),
  startedAt: DateTime.toDate(timeEntry.startedAt),
  stoppedAt: DateTime.toDate(timeEntry.stoppedAt),
  notes: Option.getOrNull(timeEntry.notes),
});

export class TimeEntryRepository extends Context.Tag(
  "@mason/time/TimeEntryRepository"
)<
  TimeEntryRepository,
  {
    insert: (params: {
      timeEntries: NonEmptyReadonlyArray<TimeEntry>;
    }) => Effect.Effect<ReadonlyArray<TimeEntry>, DatabaseError>;
    update: (params: {
      workspaceId: WorkspaceId;
      timeEntries: NonEmptyReadonlyArray<TimeEntry>;
    }) => Effect.Effect<ReadonlyArray<TimeEntry>, DatabaseError>;
    retrieve: (params: {
      workspaceId: WorkspaceId;
      query: {
        id: TimeEntryId;
      };
    }) => Effect.Effect<Option.Option<TimeEntry>, DatabaseError>;
    list: (params: {
      workspaceId: WorkspaceId;
      query: {
        ids?: ReadonlyArray<TimeEntryId>;
        startedAt?: DateTime.Utc;
        stoppedAt?: DateTime.Utc;
      };
    }) => Effect.Effect<ReadonlyArray<TimeEntry>, DatabaseError>;
    hardDelete: (params: {
      workspaceId: WorkspaceId;
      timeEntryIds: NonEmptyReadonlyArray<TimeEntryId>;
    }) => Effect.Effect<void, DatabaseError>;
  }
>() {
  static readonly live = Layer.effect(
    TimeEntryRepository,
    Effect.gen(function* () {
      const drizzle = yield* DrizzleService;

      const insertQuery = SqlSchema.findAll({
        Request: Schema.Struct({
          timeEntries: Schema.Array(TimeEntry.model),
        }),
        Result: TimeEntryDbRow,
        execute: (request) =>
          drizzle
            .insert(schema.timeEntriesTable)
            .values(request.timeEntries.map(timeEntryToDb))
            .returning()
            .execute(),
      });

      const updateQuery = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: Schema.String,
          timeEntry: TimeEntry.model,
        }),
        Result: TimeEntryDbRow,
        execute: (request) =>
          drizzle
            .update(schema.timeEntriesTable)
            .set(timeEntryToDb(request.timeEntry))
            .where(
              and(
                eq(schema.timeEntriesTable.id, request.timeEntry.id),
                eq(schema.timeEntriesTable.workspaceId, request.workspaceId)
              )
            )
            .returning()
            .execute(),
      });

      const retrieveQuery = SqlSchema.findOne({
        Request: Schema.Struct({
          workspaceId: Schema.String,
          id: Schema.String,
        }),
        Result: TimeEntryDbRow,
        execute: (request) =>
          drizzle
            .select()
            .from(schema.timeEntriesTable)
            .where(
              and(
                eq(schema.timeEntriesTable.workspaceId, request.workspaceId),
                eq(schema.timeEntriesTable.id, request.id)
              )
            )
            .limit(1)
            .execute(),
      });

      const listQuery = SqlSchema.findAll({
        Request: Schema.Struct({
          workspaceId: Schema.String,
          ids: Schema.optional(Schema.Array(Schema.String)),
          startedAt: Schema.optional(Schema.Date),
          stoppedAt: Schema.optional(Schema.Date),
        }),
        Result: TimeEntryDbRow,
        execute: (request) => {
          const whereConditions: Array<SQL> = [
            eq(schema.timeEntriesTable.workspaceId, request.workspaceId),
          ];

          if (request.ids && request.ids.length > 0) {
            whereConditions.push(
              inArray(schema.timeEntriesTable.id, request.ids)
            );
          }

          if (request.startedAt) {
            whereConditions.push(
              gte(
                schema.timeEntriesTable.startedAt,
                request.startedAt as unknown as Date
              )
            );
          }

          if (request.stoppedAt) {
            whereConditions.push(
              lte(
                schema.timeEntriesTable.stoppedAt,
                request.stoppedAt as unknown as Date
              )
            );
          }

          return drizzle
            .select()
            .from(schema.timeEntriesTable)
            .where(and(...whereConditions))
            .execute();
        },
      });

      const hardDeleteQuery = SqlSchema.void({
        Request: Schema.Struct({
          workspaceId: Schema.String,
          timeEntryIds: Schema.Array(Schema.String),
        }),
        execute: (request) =>
          drizzle
            .delete(schema.timeEntriesTable)
            .where(
              and(
                eq(schema.timeEntriesTable.workspaceId, request.workspaceId),
                inArray(schema.timeEntriesTable.id, request.timeEntryIds)
              )
            )
            .execute(),
      });

      return TimeEntryRepository.of({
        insert: Effect.fn("@mason/time/TimeEntryRepo.insert")(function* ({
          timeEntries,
        }) {
          const rows = yield* insertQuery({ timeEntries });

          return rows.map(rowToTimeEntry);
        }, wrapSqlError),

        update: Effect.fn("@mason/time/TimeEntryRepo.update")(function* ({
          workspaceId,
          timeEntries,
        }) {
          const results = yield* Effect.forEach(
            timeEntries,
            (timeEntry) => updateQuery({ workspaceId, timeEntry }),
            { concurrency: 5 }
          );

          return results.flat().map(rowToTimeEntry);
        }, wrapSqlError),

        retrieve: Effect.fn("@mason/time/TimeEntryRepo.retrieve")(function* ({
          workspaceId,
          query,
        }) {
          const maybeRow = yield* retrieveQuery({
            workspaceId,
            id: query.id,
          });

          return Option.map(maybeRow, rowToTimeEntry);
        }, wrapSqlError),

        list: Effect.fn("@mason/time/TimeEntryRepo.list")(function* ({
          workspaceId,
          query,
        }) {
          const rows = yield* listQuery({
            workspaceId,
            ids: query.ids,
            startedAt: query.startedAt
              ? DateTime.toDate(query.startedAt)
              : undefined,
            stoppedAt: query.stoppedAt
              ? DateTime.toDate(query.stoppedAt)
              : undefined,
          });

          return rows.map(rowToTimeEntry);
        }, wrapSqlError),

        hardDelete: Effect.fn("@mason/time/TimeEntryRepo.hardDelete")(
          function* ({ workspaceId, timeEntryIds }) {
            return yield* hardDeleteQuery({
              workspaceId,
              timeEntryIds: timeEntryIds,
            });
          },
          wrapSqlError
        ),
      });
    })
  );
}
