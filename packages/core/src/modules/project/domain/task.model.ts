import { DateTime, Effect, Option, Schema } from "effect";
import { ProjectId, TaskId, WorkspaceId } from "~/shared/schemas";
import { generateUUID, type SchemaFields } from "~/shared/utils";

export class Task extends Schema.TaggedClass<Task>("Task")(
  "Task",
  {
    id: TaskId,
    workspaceId: WorkspaceId,
    projectId: ProjectId,
    name: Schema.NonEmptyString.pipe(Schema.maxLength(255)),
    archivedAt: Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf),
  },
  {
    identifier: "Task",
    title: "Task",
    description: "A task within a project",
  }
) {
  private static _validate = (input: SchemaFields<typeof Task>) =>
    Schema.decodeUnknown(Task)(input);

  private static _defaultValues = {
    archivedAt: Option.none(),
  } as const;

  static create = (input: CreateTask) =>
    Effect.gen(function* () {
      const safeInput = yield* Schema.decodeUnknown(CreateTask)(input);

      return yield* Task._validate({
        ...Task._defaultValues,
        ...safeInput,
        id: TaskId.make(generateUUID()),
        _tag: "Task",
      });
    });

  patch = (patch: PatchTask) =>
    Effect.gen(this, function* () {
      const safePatch = yield* Schema.decodeUnknown(PatchTask)(patch);

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

export type CreateTask = typeof CreateTask.Type;
export const CreateTask = Schema.Struct({
  workspaceId: WorkspaceId,
  projectId: ProjectId,
  name: Task.fields.name,
});

export type PatchTask = typeof PatchTask.Type;
export const PatchTask = Schema.Struct({
  name: Schema.optional(Task.fields.name),
});
