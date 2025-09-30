import { Layer } from "effect";
import { DatabaseService } from "./services/db";
import { ProjectsService } from "./services/projects";
import { WorkspaceIntegrationsService } from "./services/workspace-integrations";

export const appLayer = Layer.mergeAll(
  WorkspaceIntegrationsService.Default.pipe(
    Layer.provideMerge(ProjectsService.Default)
  )
).pipe(Layer.provideMerge(DatabaseService.Default));
