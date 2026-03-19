import { ServiceMap } from "effect";
import type { Effect, Option } from "effect";

import type { RepositoryError } from "#shared/repository/index";

import type { TimeEntry } from "./domain/time-entry.entity";

export interface TimeEntryRepositoryShape {
  readonly insertMany: (
    data: ReadonlyArray<typeof TimeEntry.insert.Type>
  ) => Effect.Effect<ReadonlyArray<TimeEntry>, RepositoryError>;
  readonly update: (params: {
    workspaceId: TimeEntry["workspaceId"];
    id: TimeEntry["id"];
    update: typeof TimeEntry.update.Type;
  }) => Effect.Effect<TimeEntry, RepositoryError>;
  readonly hardDeleteMany: (params: {
    workspaceId: TimeEntry["workspaceId"];
    ids: ReadonlyArray<TimeEntry["id"]>;
  }) => Effect.Effect<void, RepositoryError>;
  readonly findById: (params: {
    workspaceId: TimeEntry["workspaceId"];
    id: TimeEntry["id"];
  }) => Effect.Effect<Option.Option<TimeEntry>, RepositoryError>;
  readonly findRunningByWorkspaceMember: (params: {
    workspaceId: TimeEntry["workspaceId"];
    workspaceMemberId: TimeEntry["workspaceMemberId"];
  }) => Effect.Effect<Option.Option<TimeEntry>, RepositoryError>;
}

export class TimeEntryRepository extends ServiceMap.Service<
  TimeEntryRepository,
  TimeEntryRepositoryShape
>()("@mason/time/TimeEntryRepository") {}
