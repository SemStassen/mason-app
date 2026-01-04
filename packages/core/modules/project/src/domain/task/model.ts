import {
  ExistingProjectId,
  ExistingTaskId,
  ExistingWorkspaceId,
} from "@mason/framework";
import { Schema } from "effect";

/**
 * Task field definitions.
 *
 * Used to construct the Task domain model and derive DTOs.
 * Access individual fields via `TaskFields.fields.fieldName`.
 *
 * @category Schema
 * @since 0.1.0
 */
export const TaskFields = Schema.TaggedStruct("@mason/project/Task", {
  id: ExistingTaskId,
  workspaceId: ExistingWorkspaceId,
  projectId: ExistingProjectId,
  name: Schema.NonEmptyString.pipe(Schema.maxLength(255)),
  _metadata: Schema.OptionFromSelf(
    Schema.Struct({
      source: Schema.optionalWith(Schema.Literal("float"), { exact: true }),
      externalId: Schema.optionalWith(Schema.String, { exact: true }),
    })
  ),
  deletedAt: Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf),
});

/**
 * Task domain model.
 *
 * Represents a task within a project.
 *
 * @category Models
 * @since 0.1.0
 */
export type Task = typeof Task.Type;
export const Task = TaskFields.pipe(
  Schema.Data,
  Schema.annotations({
    identifier: "Task",
    title: "Task",
    description: "A task within a project",
  })
);
