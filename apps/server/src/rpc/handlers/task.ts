import {
  ArchiveTaskFlow,
  CreateTaskFlow,
  RestoreTaskFlow,
  TaskRpcs,
  UpdateTaskFlow,
} from "@mason/core";
import { Effect } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";

export const TaskRpcsLive = TaskRpcs.toLayer({
  "Task.Create": (request) =>
    CreateTaskFlow(request).pipe(
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
  "Task.Update": (request) =>
    UpdateTaskFlow(request).pipe(
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
  "Task.Archive": (request) =>
    ArchiveTaskFlow(request).pipe(
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
  "Task.Restore": (request) =>
    RestoreTaskFlow(request).pipe(
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
});
