import { InternalServerError } from "@effect/platform/HttpApiError";
import {
  ArchiveProjectFlow,
  CreateProjectFlow,
  PatchProjectFlow,
  ProjectRpcs,
  RestoreProjectFlow,
} from "@mason/core";
import { Effect, pipe } from "effect";

export const ProjectRpcsLive = ProjectRpcs.toLayer({
  "Project.Create": (request) =>
    pipe(
      CreateProjectFlow(request),
      Effect.catchTags({
        "shared/MasonError": () => new InternalServerError(),
      })
    ),
  "Project.Patch": (request) =>
    pipe(
      PatchProjectFlow(request),
      Effect.catchTags({
        "shared/MasonError": () => new InternalServerError(),
      })
    ),
  "Project.Archive": (request) =>
    pipe(
      ArchiveProjectFlow(request),
      Effect.catchTags({
        "shared/MasonError": () => new InternalServerError(),
      })
    ),
  "Project.Restore": (request) =>
    pipe(
      RestoreProjectFlow(request),
      Effect.catchTags({
        "shared/MasonError": () => new InternalServerError(),
      })
    ),
});
