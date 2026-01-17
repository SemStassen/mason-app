import { Schema } from "effect";

export class ProjectTransitionError extends Schema.TaggedError<ProjectTransitionError>()(
  "project/ProjectTransitionError",
  {
    cause: Schema.Unknown,
  }
) {}

export class TaskTransitionError extends Schema.TaggedError<TaskTransitionError>()(
  "project/TaskTransitionError",
  {
    cause: Schema.Unknown,
  }
) {}

export class ProjectArchivedError extends Schema.TaggedError<ProjectArchivedError>()(
  "project/ProjectArchivedError",
  {}
) {}
