import { HttpApiBuilder, HttpApiError } from "@effect/platform";
import { MasonApi } from "@mason/api-contract";
import { ProjectResponse } from "@mason/api-contract/dto/project.dto";
import { listProjectsUseCase } from "@mason/use-cases/projects.use-cases";
import { Effect } from "effect";
import { RequestContext } from "~/middleware/auth.middleware";

export const ProjectGroupLive = HttpApiBuilder.group(
  MasonApi,
  "Project",
  (handlers) =>
    Effect.gen(function* () {
      return handlers.handle("List", () =>
        Effect.gen(function* () {
          const ctx = yield* RequestContext;

          const projects = yield* listProjectsUseCase({
            workspaceId: ctx.workspaceId,
          });

          return projects.map((project) => ProjectResponse.make(project));
        }).pipe(
          Effect.tapError((e) => Effect.logError(e)),
          Effect.mapError(() => new HttpApiError.InternalServerError())
        )
      );
    })
);
