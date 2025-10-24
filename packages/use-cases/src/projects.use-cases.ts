import type { ProjectId, WorkspaceId } from "@mason/core/models/ids";
import { ProjectsService } from "@mason/core/services/projects.service";
import { Effect } from "effect";

export const listProjectsUseCase = ({
  workspaceId,
  query,
}: {
  workspaceId: typeof WorkspaceId.Type;
  query?: {
    ids?: Array<typeof ProjectId.Type>;
  };
}) =>
  Effect.gen(function* () {
    const projectsService = yield* ProjectsService;

    const projects = yield* projectsService.listProjects({
      workspaceId: workspaceId,
      query: {
        ...(query?.ids && { ids: query.ids }),
      },
    });

    return projects;
  });
