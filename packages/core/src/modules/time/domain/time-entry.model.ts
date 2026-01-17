import { DateTime, Effect, Option, Schema } from "effect";
import {
  JsonRecord,
  MemberId,
  ProjectId,
  TaskId,
  TimeEntryId,
  WorkspaceId,
} from "~/shared/schemas";
import { generateUUID, type SchemaFields } from "~/shared/utils";
import { TimeEntryTransitionError } from "./errors";

export class TimeEntry extends Schema.TaggedClass<TimeEntry>("TimeEntry")(
  "TimeEntry",
  {
    id: TimeEntryId,
    workspaceId: WorkspaceId,
    memberId: MemberId,
    projectId: ProjectId,
    taskId: Schema.OptionFromSelf(TaskId),
    startedAt: Schema.DateTimeUtcFromSelf,
    stoppedAt: Schema.DateTimeUtcFromSelf,
    notes: Schema.OptionFromSelf(JsonRecord),
  },
  {
    identifier: "TimeEntry",
    title: "Time Entry",
    description: "A time entry tracking work on a project",
  }
) {
  private static _validate = (input: SchemaFields<typeof TimeEntry>) =>
    Schema.decodeUnknown(TimeEntry)(input);

  private static _defaults = {
    taskId: Option.none(),
    notes: Option.none(),
  };

  static create = (input: CreateTimeEntry) =>
    Effect.gen(function* () {
      const safeInput = yield* Schema.decodeUnknown(CreateTimeEntry)(input);

      const timeEntry = yield* TimeEntry._validate({
        ...TimeEntry._defaults,
        ...safeInput,
        id: TimeEntryId.make(generateUUID()),
        _tag: "TimeEntry",
      });

      yield* timeEntry.assertValidDates();

      return timeEntry;
    });

  patch = (patch: PatchTimeEntry) =>
    Effect.gen(this, function* () {
      const safePatch = yield* Schema.decodeUnknown(PatchTimeEntry)(patch);

      const patched = yield* TimeEntry._validate({
        ...this,
        ...safePatch,
      });

      yield* patched.assertValidDates();

      return patched;
    });

  /** Assertions */

  private readonly assertValidDates = () =>
    Effect.gen(this, function* () {
      if (DateTime.lessThan(this.stoppedAt, this.startedAt)) {
        return yield* Effect.fail(
          new TimeEntryTransitionError({
            cause: "Stopped time must be after started time",
          })
        );
      }
    });
}

export type CreateTimeEntry = typeof CreateTimeEntry.Type;
export const CreateTimeEntry = Schema.Struct({
  workspaceId: WorkspaceId,
  memberId: MemberId,
  projectId: ProjectId,
  startedAt: TimeEntry.fields.startedAt,
  stoppedAt: TimeEntry.fields.stoppedAt,
  taskId: Schema.optionalWith(TimeEntry.fields.taskId, { exact: true }),
  notes: Schema.optionalWith(TimeEntry.fields.notes, { exact: true }),
});

export type PatchTimeEntry = typeof PatchTimeEntry.Type;
export const PatchTimeEntry = Schema.partialWith(
  Schema.Struct({
    projectId: TimeEntry.fields.projectId,
    taskId: TimeEntry.fields.taskId,
    startedAt: TimeEntry.fields.startedAt,
    stoppedAt: TimeEntry.fields.stoppedAt,
    notes: TimeEntry.fields.notes,
  }),
  { exact: true }
);
