import { type Effect, Option, type ParseResult, Schema } from "effect";
import { dual } from "effect/Function";
import { type ProjectId, TaskId, type WorkspaceId } from "~/shared/schemas";
import {
  generateUUID,
  isDeleted,
  makeRestore,
  makeSoftDelete,
} from "~/shared/utils";
import { Task } from "../schemas/task.model";

// =============================================================================
// Constructors
// =============================================================================

/** Internal: validates and constructs a Task via Schema. */
const _make = (
  input: typeof Task.Type
): Effect.Effect<Task, ParseResult.ParseError> => Schema.validate(Task)(input);

/** Default values for new tasks. */
const defaults = {
  deletedAt: Option.none(),
} as const;

/**
 * Create a new task with generated ID.
 *
 * @internal - Use Project.addTask instead for external creation
 * @category Constructors
 * @since 0.1.0
 */
const createTask = (
  input: {
    name: Task["name"];
  },
  system: {
    workspaceId: WorkspaceId;
    projectId: ProjectId;
  }
): Effect.Effect<Task, ParseResult.ParseError> =>
  _make({
    ...defaults,
    ...input,
    workspaceId: system.workspaceId,
    projectId: system.projectId,
    id: TaskId.make(generateUUID()),
    _tag: "Task",
  });

// =============================================================================
// Predicates
// =============================================================================

/**
 * Check if task is deleted.
 *
 * @category Predicates
 * @since 0.1.0
 */
const isTaskDeleted = isDeleted;
// =============================================================================
// Transformations
// =============================================================================

interface PatchTask {
  name?: Task["name"];
}

/**
 * Update a task with patch data.
 *
 * @category Transformations
 * @since 0.1.0
 */
const updateTask = dual<
  (
    patch: PatchTask
  ) => (self: Task) => Effect.Effect<Task, ParseResult.ParseError>,
  (self: Task, patch: PatchTask) => Effect.Effect<Task, ParseResult.ParseError>
>(2, (self, patch) =>
  _make({
    ...self,
    ...patch,
    id: self.id,
  })
);

/**
 * Soft delete a task.
 *
 * @category Transformations
 * @since 0.1.0
 */
const softDeleteTask = makeSoftDelete(_make);

/**
 * Restore a soft-deleted task.
 *
 * @category Transformations
 * @since 0.1.0
 */
const restoreTask = makeRestore(_make);

export const TaskFns = {
  create: createTask,
  update: updateTask,
  softDelete: softDeleteTask,
  restore: restoreTask,
  isDeleted: isTaskDeleted,
} as const;
