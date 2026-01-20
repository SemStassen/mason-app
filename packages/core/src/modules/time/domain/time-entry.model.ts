import { DateTime, Effect, Option, Schema } from "effect";
import {
  JsonRecord,
  MemberId,
  Model,
  ProjectId,
  TaskId,
  TimeEntryId,
  WorkspaceId,
} from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";
import { TimeEntryTransitionError } from "./errors";

export class TimeEntry extends Model.Class<TimeEntry>("TimeEntry")(
  {
    id: Model.DomainManaged(TimeEntryId),
    workspaceId: Model.SystemImmutable(WorkspaceId),
    memberId: Model.SystemImmutable(MemberId),
    projectId: Model.Mutable(ProjectId),
    taskId: Model.OptionalMutable(Schema.OptionFromSelf(TaskId)),
    startedAt: Model.Mutable(Schema.DateTimeUtcFromSelf),
    stoppedAt: Model.Mutable(Schema.DateTimeUtcFromSelf),
    notes: Model.OptionalMutable(Schema.OptionFromSelf(JsonRecord)),
  },
  {
    identifier: "TimeEntry",
    title: "Time Entry",
    description: "A time entry tracking work on a project",
  }
) {
  private static _validate = (input: typeof TimeEntry.model.Type) =>
    Schema.validate(TimeEntry)(input);

  static fromInput = (input: typeof TimeEntry.create.Type) =>
    Effect.gen(function* () {
      const safeInput = yield* Schema.decodeUnknown(TimeEntry.create)(input);

      const timeEntry = yield* TimeEntry._validate({
        ...safeInput,
        id: TimeEntryId.make(generateUUID()),
        taskId: safeInput.taskId ?? Option.none(),
        notes: safeInput.notes ?? Option.none(),
      });

      yield* timeEntry.assertValidDates();

      return timeEntry;
    });

  patch = (patch: typeof TimeEntry.patch.Type) =>
    Effect.gen(this, function* () {
      const safePatch = yield* Schema.decodeUnknown(TimeEntry.patch)(patch);

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
