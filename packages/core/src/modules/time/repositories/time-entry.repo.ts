import { Context, type DateTime, type Effect, type Option } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/infra/db";
import type { TimeEntryId, WorkspaceId } from "~/shared/schemas";
import type { AtLeastOne } from "~/shared/utils";
import type { TimeEntry } from "../domain";

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
      query: AtLeastOne<{
        id: TimeEntryId;
      }>;
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
>() {}
