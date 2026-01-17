import { Schema } from "effect";

export class WorkspaceSlugAlreadyExistsError extends Schema.TaggedError<WorkspaceSlugAlreadyExistsError>()(
  "workspace/WorkspaceSlugAlreadyExistsError",
  {},
) {}
