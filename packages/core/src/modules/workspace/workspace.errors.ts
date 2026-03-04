import { Schema } from "effect";

export class WorkspaceNotFoundError extends Schema.TaggedError<WorkspaceNotFoundError>()(
  "workspace/WorkspaceNotFoundError",
  {}
) {}
