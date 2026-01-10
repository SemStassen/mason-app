import { Schema } from "effect";

export class WorkspaceDomainError extends Schema.TaggedError<WorkspaceDomainError>()(
  "workspace/WorkspaceDomainError",
  {
    cause: Schema.Unknown,
  }
) {}

export class WorkspaceNotFoundError extends Schema.TaggedError<WorkspaceNotFoundError>()(
  "workspace/WorkspaceNotFoundError",
  {}
) {}
