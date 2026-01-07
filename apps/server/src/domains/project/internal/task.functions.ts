import { Effect, Option, Schema } from "effect";
import { dual } from "effect/Function";
import { type ProjectId, TaskId, type WorkspaceId } from "~/shared/schemas";
import {
  generateUUID,
  isDeleted,
  makeRestore,
  makeSoftDelete,
} from "~/shared/utils";
import { Task } from "../schemas/task.model";
import { ProjectDomainError } from "./errors";

// =============================================================================
// Constructors
// =============================================================================

/** Internal: validates and constructs a Task via Schema. */
const _validate = (
  input: typeof Task.Type
): Effect.Effect<Task, ProjectDomainError> =>
  Schema.validate(Task)(input).pipe(
    Effect.catchTags({
      ParseError: (e) => Effect.fail(new ProjectDomainError({ cause: e })),
    })
  );

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
): Effect.Effect<Task, ProjectDomainError> =>
  _validate({
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
  (patch: PatchTask) => (self: Task) => Effect.Effect<Task, ProjectDomainError>,
  (self: Task, patch: PatchTask) => Effect.Effect<Task, ProjectDomainError>
>(2, (self, patch) =>
  _validate({
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
const softDeleteTask = makeSoftDelete(_validate);

/**
 * Restore a soft-deleted task.
 *
 * @category Transformations
 * @since 0.1.0
 */
const restoreTask = makeRestore(_validate);

export const TaskFns = {
  create: createTask,
  update: updateTask,
  softDelete: softDeleteTask,
  restore: restoreTask,
  isDeleted: isTaskDeleted,
} as const;
