import { Schema } from "effect";

export class InternalProjectModuleError extends Schema.TaggedError<InternalProjectModuleError>()(
  "project/InternalProjectModuleError",
  {
    cause: Schema.Unknown,
  }
) {}

export class ProjectNotFoundError extends Schema.TaggedError<ProjectNotFoundError>()(
  "project/ProjectNotFoundError",
  {
    projectId: Schema.String,
  }
) {}

export class TaskNotFoundError extends Schema.TaggedError<TaskNotFoundError>()(
  "project/TaskNotFoundError",
  {
    taskId: Schema.String,
  }
) {}
