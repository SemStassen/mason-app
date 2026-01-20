import { DateTime, Effect, Option, Schema } from "effect";
import { Model, ProjectId, TaskId, WorkspaceId } from "~/shared/schemas";
import { generateUUID } from "~/shared/utils";

export class Task extends Model.Class<Task>("Task")(
  {
    id: Model.DomainManaged(TaskId),
    workspaceId: Model.SystemImmutable(WorkspaceId),
    projectId: Model.UserImmutable(ProjectId),
    name: Model.Mutable(Schema.NonEmptyString.pipe(Schema.maxLength(255))),
    archivedAt: Model.DomainManaged(
      Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf)
    ),
  },
  {
    identifier: "Task",
    title: "Task",
    description: "A task within a project",
  }
) {
  private static _validate = (input: typeof Task.model.Type) =>
    Schema.validate(Task)(input);

  static fromInput = (input: typeof Task.create.Type) =>
    Effect.gen(function* () {
      const safeInput = yield* Schema.decodeUnknown(Task.create)(input);

      return yield* Task._validate({
        ...safeInput,
        id: TaskId.make(generateUUID()),
        archivedAt: Option.none(),
      });
    });

  patch = (patch: typeof Task.patch.Type) =>
    Effect.gen(this, function* () {
      const safePatch = yield* Schema.decodeUnknown(Task.patch)(patch);

      return yield* Task._validate({
        ...this,
        ...safePatch,
      });
    });

  archive = () =>
    Effect.gen(this, function* () {
      const now = yield* DateTime.now;

      return yield* Task._validate({
        ...this,
        archivedAt: Option.some(now),
      });
    });

  restore = () =>
    Effect.gen(this, function* () {
      return yield* Task._validate({
        ...this,
        archivedAt: Option.none(),
      });
    });

  /** Predicates */

  readonly isArchived = () => Option.isSome(this.archivedAt);
}
