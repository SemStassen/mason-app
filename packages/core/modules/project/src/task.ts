import {
  ExistingProjectId,
  ExistingTaskId,
  ExistingWorkspaceId,
  generateUUID,
  TaskId,
} from "@mason/framework";
import { DateTime, Effect, Schema } from "effect";
import { dual } from "effect/Function";
import type { ParseError } from "effect/ParseResult";

// =============================================================================
// Schema
// =============================================================================

const TaskBase = Schema.TaggedStruct("Task", {
  id: ExistingTaskId,
  workspaceId: ExistingWorkspaceId,
  projectId: ExistingProjectId,
  name: Schema.NonEmptyString.pipe(Schema.maxLength(255)),
  _metadata: Schema.NullOr(
    Schema.Struct({
      source: Schema.optionalWith(Schema.Literal("float"), {
        exact: true,
      }),
      externalId: Schema.optionalWith(Schema.String, {
        exact: true,
      }),
    })
  ),
  deletedAt: Schema.NullOr(Schema.DateTimeUtcFromSelf),
});

export const Task = TaskBase.pipe(
  Schema.Data,
  Schema.annotations({
    identifier: "Task",
    title: "Task",
    description: "A task within a project",
  })
);

export type Task = Schema.Schema.Type<typeof Task>;

// =============================================================================
// Creation
// =============================================================================

export const CreateTask = Schema.Struct({
  workspaceId: TaskBase.fields.workspaceId,
  projectId: TaskBase.fields.projectId,
  name: TaskBase.fields.name,
  _metadata: Schema.optionalWith(TaskBase.fields._metadata, {
    exact: true,
    default: () => null,
  }),
});

/**
 * Create a task from creation input.
 *
 * @since 0.1.0
 */
export const createTask = (
  input: typeof CreateTask.Type
): Effect.Effect<Task, ParseError> =>
  Schema.decodeUnknown(CreateTask)(input).pipe(
    Effect.flatMap((validated) =>
      Schema.decodeUnknown(Task)({
        ...validated,
        id: TaskId.make(generateUUID()),
        deletedAt: null,
      })
    )
  );

// =============================================================================
// Updates
// =============================================================================

export const PatchTask = Schema.Struct({
  name: Schema.optionalWith(TaskBase.fields.name, { exact: true }),
  _metadata: Schema.optionalWith(TaskBase.fields._metadata, {
    exact: true,
  }),
});

/**
 * Update a task with patch data.
 *
 * @since 0.1.0
 */
export const updateTask = dual<
  (
    updates: typeof PatchTask.Type
  ) => (self: Task) => Effect.Effect<Task, ParseError>,
  (
    self: Task,
    updates: typeof PatchTask.Type
  ) => Effect.Effect<Task, ParseError>
>(2, (self, updates) =>
  Schema.decodeUnknown(PatchTask)(updates).pipe(
    Effect.flatMap((validated) => {
      const mergedMetadata =
        self._metadata && validated._metadata
          ? { ...self._metadata, ...validated._metadata }
          : (validated._metadata ?? self._metadata);

      return Schema.decodeUnknown(Task)({
        ...self,
        ...validated,
        _metadata: mergedMetadata,
      });
    })
  )
);

// =============================================================================
// Soft Delete
// =============================================================================

/**
 * Soft delete a task by setting deletedAt.
 *
 * @since 0.1.0
 */
export const softDeleteTask = (self: Task): Effect.Effect<Task> =>
  Effect.gen(function* () {
    if (self.deletedAt) {
      return self;
    }
    const deletedAt = yield* DateTime.now;
    return { ...self, deletedAt };
  });
