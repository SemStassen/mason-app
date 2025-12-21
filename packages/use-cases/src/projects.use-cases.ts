import type { ProjectId, WorkspaceId } from "@mason/mason/models/ids";
import { ProjectsService } from "@mason/mason/services/projects.service";
import { Effect } from "effect";

export const listProjectsUseCase = 
  Effect.fn("listProjectsUseCase")(function* ({
    workspaceId,
    query,
  }: {
    workspaceId: typeof WorkspaceId.Type;
    query?: {
      ids?: Array<typeof ProjectId.Type>;
    };
  }) {
    const projectsService = yield* ProjectsService;

    const projects = yield* projectsService.listProjects({
      workspaceId: workspaceId,
      query: {
        ...(query?.ids && { ids: query.ids }),
      },
    });

    return projects;
  });
