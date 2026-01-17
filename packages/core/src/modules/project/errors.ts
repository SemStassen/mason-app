import { Schema } from "effect";

export class ProjectNotFoundError extends Schema.TaggedError<ProjectNotFoundError>()(
  "project/ProjectNotFoundError",
  {}
) {}

export class TaskNotFoundError extends Schema.TaggedError<TaskNotFoundError>()(
  "project/TaskNotFoundError",
  {}
) {}
