import { Effect } from "effect";
import { ProjectArchivedError } from "./errors";
import type { Project } from "./project.model";

export const AssertProjectNotArchived = Effect.fn(
  "project/AssertProjectNotArchived"
)(function* (project: Project) {
  if (project.isArchived()) {
    return yield* Effect.fail(new ProjectArchivedError());
  }

  return project;
});
