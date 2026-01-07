import { Context, type DateTime, type Effect, type Option } from "effect";
import type { NonEmptyReadonlyArray } from "effect/Array";
import type { DatabaseError } from "~/shared/errors";
import type { TimeEntryId, WorkspaceId } from "~/shared/schemas";
import type { TimeEntry } from "../schemas/time-entry.model";

export class TimeEntryRepository extends Context.Tag(
  "@mason/time/TimeEntryRepository"
)<
  TimeEntryRepository,
  {
    insert: (params: {
      workspaceId: WorkspaceId;
      timeEntries: NonEmptyReadonlyArray<TimeEntry>;
    }) => Effect.Effect<ReadonlyArray<TimeEntry>, DatabaseError>;
    update: (params: {
      workspaceId: WorkspaceId;
      timeEntries: NonEmptyReadonlyArray<TimeEntry>;
    }) => Effect.Effect<ReadonlyArray<TimeEntry>, DatabaseError>;
    softDelete: (params: {
      timeEntryIds: NonEmptyReadonlyArray<TimeEntryId>;
    }) => Effect.Effect<void, DatabaseError>;
    retrieve: (params: {
      workspaceId: WorkspaceId;
      query: {
        id?: TimeEntryId;
        _includeDeleted?: boolean;
      };
    }) => Effect.Effect<Option.Option<TimeEntry>, DatabaseError>;
    list: (params: {
      workspaceId: WorkspaceId;
      query?: {
        ids?: ReadonlyArray<TimeEntryId>;
        startedAt?: DateTime.Utc;
        stoppedAt?: DateTime.Utc;
        _includeDeleted?: boolean;
      };
    }) => Effect.Effect<ReadonlyArray<TimeEntry>, DatabaseError>;
  }
>() {}
