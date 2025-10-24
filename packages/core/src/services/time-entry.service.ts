import { and, eq, gte, inArray, lte } from "@mason/db/operators";
import { type DbTimeEntry, timeEntriesTable } from "@mason/db/schema";
import { Effect, Schema } from "effect";
import { MemberId, TaskId, TimeEntryId, type WorkspaceId } from "../models/ids";
import { Task } from "../models/task.model";
import {
  TimeEntry,
  type TimeEntryToCreate,
  type TimeEntryToUpdate,
} from "../models/time-entry.model";
import { createDomainEntities, updateDomainEntities } from "./crud-helpers";
import { DatabaseService } from "./db.service";

export class TimeEntryService extends Effect.Service<TimeEntryService>()(
  "@mason/core/timeEntryService",
  {
    effect: Effect.gen(function* () {
      const db = yield* DatabaseService;

      const createTimeEntries = ({
        workspaceId,
        timeEntries,
      }: {
        workspaceId: typeof WorkspaceId.Type;
        timeEntries: Array<typeof TimeEntryToCreate.Type>;
      }) =>
        createDomainEntities({
          entityName: "TimeEntry",
          inputs: timeEntries,
          toDomain: (input) => TimeEntry.makeFromCreate(input, workspaceId),
          saveBatch: (entities) =>
            db.use(workspaceId, (conn) =>
              conn.insert(timeEntriesTable).values(entities).returning()
            ),
          fromDb: (dbRecord) => TimeEntry.makeFromDb(dbRecord),
        });

      const updateTimeEntries = ({
        workspaceId,
        timeEntries,
      }: {
        workspaceId: typeof WorkspaceId.Type;
        timeEntries: Array<typeof TimeEntryToUpdate.Type>;
      }) =>
        updateDomainEntities({
          entityName: "TimeEntry",
          inputs: timeEntries,
          fetchExisting: (ids) =>
            db.use(workspaceId, (conn) =>
              conn.query.timeEntriesTable.findMany({
                where: ({ id }) => inArray(id, ids),
              })
            ),
          toDomain: (update, existing) =>
            TimeEntry.makeFromUpdate(update, existing),
          fromDb: (dbRecord) => TimeEntry.makeFromDb(dbRecord),
          saveUpdates: (entities) =>
            db.withTransaction(
              Effect.gen(function* () {
                const results: Array<DbTimeEntry> = [];

                for (const entity of entities) {
                  const [updated] = yield* db.use(workspaceId, (conn) =>
                    conn
                      .update(timeEntriesTable)
                      .set(entity)
                      .where(
                        and(
                          eq(timeEntriesTable.workspaceId, workspaceId),
                          eq(timeEntriesTable.id, entity.id)
                        )
                      )
                      .returning()
                  );
                  results.push(updated);
                }

                return results;
              })
            ),
        });

      return {
        createTimeEntries: createTimeEntries,
        updateTimeEntries: updateTimeEntries,
        softDeleteTimeEntries: ({
          workspaceId,
          timeEntryIds,
        }: {
          workspaceId: typeof WorkspaceId.Type;
          timeEntryIds: Array<typeof TimeEntryId.Type>;
        }) =>
          Effect.gen(function* () {
            if (!timeEntryIds.length) {
              yield* Effect.logDebug("softDeleteTimeEntries: 0 supplied");
              return [];
            }

            return yield* db.use(workspaceId, (conn) =>
              conn
                .update(timeEntriesTable)
                .set({ deletedAt: new Date() })
                .where(
                  and(
                    eq(timeEntriesTable.workspaceId, workspaceId),
                    inArray(timeEntriesTable.id, timeEntryIds)
                  )
                )
            );
          }),
        hardDeleteTimeEntries: ({
          workspaceId,
          timeEntryIds,
        }: {
          workspaceId: typeof WorkspaceId.Type;
          timeEntryIds: Array<typeof TimeEntryId.Type>;
        }) =>
          Effect.gen(function* () {
            if (!timeEntryIds.length) {
              yield* Effect.logDebug("hardDeleteTimeEntries: 0 supplied");
              return [];
            }
            return yield* db.use(workspaceId, (conn) =>
              conn
                .delete(timeEntriesTable)
                .where(
                  and(
                    eq(timeEntriesTable.workspaceId, workspaceId),
                    inArray(timeEntriesTable.id, timeEntryIds)
                  )
                )
            );
          }),
        listTimeEntries: ({
          workspaceId,
          query,
        }: {
          workspaceId: typeof WorkspaceId.Type;
          query?: {
            startedAt?: Date;
            stoppedAt?: Date;
          };
        }) =>
          Effect.gen(function* () {
            const whereConditions = [
              eq(timeEntriesTable.workspaceId, workspaceId),
              query?.startedAt
                ? gte(timeEntriesTable.startedAt, query.startedAt)
                : undefined,
              query?.stoppedAt
                ? lte(timeEntriesTable.stoppedAt, query.stoppedAt)
                : undefined,
            ].filter(Boolean);

            const timeEntries = yield* db.use(workspaceId, (conn) =>
              conn.query.timeEntriesTable.findMany({
                where: and(...whereConditions),
              })
            );

            return timeEntries.map((t) =>
              Schema.decodeUnknownSync(Task)({
                ...t,
                id: TimeEntryId.make(t.id),
                memberId: MemberId.make(t.memberId),
                taskId: TaskId.make(t.taskId),
                workspaceId: workspaceId,
              })
            );
          }),
      };
    }),
  }
) {}
