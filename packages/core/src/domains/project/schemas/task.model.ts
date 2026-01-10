import { Schema } from "effect";
import { ProjectId, TaskId, WorkspaceId } from "~/shared/schemas";

export type TaskName = typeof TaskName.Type;
export const TaskName = Schema.NonEmptyString.pipe(Schema.maxLength(255));

/**
 * Task domain model.
 *
 * Represents a task within a project.
 *
 * @category Models
 * @since 0.1.0
 */
export type Task = typeof Task.Type;
export const Task = Schema.TaggedStruct("Task", {
  id: TaskId,
  workspaceId: WorkspaceId,
  projectId: ProjectId,
  name: TaskName,
  deletedAt: Schema.OptionFromSelf(Schema.DateTimeUtcFromSelf),
}).pipe(
  Schema.Data,
  Schema.annotations({
    identifier: "Task",
    title: "Task",
    description: "A task within a project",
  })
);
