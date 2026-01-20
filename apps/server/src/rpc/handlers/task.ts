import { InternalServerError } from "@effect/platform/HttpApiError";
import {
  ArchiveTaskFlow,
  CreateTaskFlow,
  PatchTaskFlow,
  RestoreTaskFlow,
  TaskRpcs,
} from "@mason/core";
import { Effect, pipe } from "effect";

export const TaskRpcsLive = TaskRpcs.toLayer({
  "Task.Create": (request) =>
    pipe(
      CreateTaskFlow(request),
      Effect.catchTags({
        "shared/MasonError": () => new InternalServerError(),
      })
    ),
  "Task.Patch": (request) =>
    pipe(
      PatchTaskFlow(request),
      Effect.catchTags({
        "shared/MasonError": () => new InternalServerError(),
      })
    ),
  "Task.Archive": (request) =>
    pipe(
      ArchiveTaskFlow(request),
      Effect.catchTags({
        "shared/MasonError": () => new InternalServerError(),
      })
    ),
  "Task.Restore": (request) =>
    pipe(
      RestoreTaskFlow(request),
      Effect.catchTags({
        "shared/MasonError": () => new InternalServerError(),
      })
    ),
});
