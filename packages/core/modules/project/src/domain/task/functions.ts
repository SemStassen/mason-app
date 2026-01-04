import {
  Domain,
  type ExistingProjectId,
  ExistingTaskId,
  type ExistingWorkspaceId,
  generateUUID,
  safeMerge,
} from "@mason/framework";
import { type Effect, Option, type ParseResult, Schema } from "effect";
import { dual } from "effect/Function";
import { Task } from "./model";

// =============================================================================
// Constructors
// =============================================================================

/** Internal: validates and constructs a Task via Schema. */
const make = (
  input: typeof Task.Type
): Effect.Effect<Task, ParseResult.ParseError> =>
  Schema.decodeUnknown(Task)(input);

/** Default values for new tasks. */
const defaults = {
  _metadata: Option.none(),
  deletedAt: Option.none(),
} as const;

/**
 * Create a new task with generated ID.
 *
 * @internal - Use Project.addTask instead for external creation
 * @category Constructors
 * @since 0.1.0
 */
export const create = (
  input: {
    name: Task["name"];
    _metadata?: Task["_metadata"];
  },
  ids: {
    workspaceId: ExistingWorkspaceId;
    projectId: ExistingProjectId;
  }
): Effect.Effect<Task, ParseResult.ParseError> =>
  make({
    ...defaults,
    ...input,
    workspaceId: ids.workspaceId,
    projectId: ids.projectId,
    id: ExistingTaskId.make(generateUUID()),
    _tag: "@mason/project/Task",
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
export const isDeleted = Domain.isDeleted;

// =============================================================================
// Transformations
// =============================================================================

interface PatchTask {
  name?: Task["name"];
  _metadata?: Task["_metadata"];
}

/**
 * Update a task with patch data.
 *
 * @category Transformations
 * @since 0.1.0
 */
export const update = dual<
  (
    patch: PatchTask
  ) => (self: Task) => Effect.Effect<Task, ParseResult.ParseError>,
  (self: Task, patch: PatchTask) => Effect.Effect<Task, ParseResult.ParseError>
>(2, (self, patch) =>
  make({
    ...self,
    ...patch,
    id: self.id,
    _metadata: safeMerge(self._metadata, patch._metadata),
  })
);

/**
 * Soft delete a task.
 *
 * @category Transformations
 * @since 0.1.0
 */
export const softDelete = Domain.makeSoftDelete(make);

/**
 * Restore a soft-deleted task.
 *
 * @category Transformations
 * @since 0.1.0
 */
export const restore = Domain.makeRestore(make);
