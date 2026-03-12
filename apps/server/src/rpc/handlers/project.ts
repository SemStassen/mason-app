import {
  ArchiveProjectFlow,
  CreateProjectFlow,
  ProjectRpcs,
  RestoreProjectFlow,
  UpdateProjectFlow,
} from "@mason/core";
import { Effect } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";

export const ProjectRpcsLive = ProjectRpcs.toLayer({
  "Project.Create": (request) =>
    CreateProjectFlow(request).pipe(
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
  "Project.Update": (request) =>
    UpdateProjectFlow(request).pipe(
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
  "Project.Archive": (request) =>
    ArchiveProjectFlow(request).pipe(
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
  "Project.Restore": (request) =>
    RestoreProjectFlow(request).pipe(
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
});
