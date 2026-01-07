import { Schema } from "effect";

export class ProjectDomainError extends Schema.TaggedError<ProjectDomainError>()(
  "project/ProjectDomainError",
  {
    cause: Schema.Unknown,
  }
) {}

export class ProjectNotFoundError extends Schema.TaggedError<ProjectNotFoundError>()(
  "project/ProjectNotFoundError",
  {}
) {}

export class TaskNotFoundError extends Schema.TaggedError<TaskNotFoundError>()(
  "project/TaskNotFoundError",
  {}
) {}
