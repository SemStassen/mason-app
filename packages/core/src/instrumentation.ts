import { Layer } from "effect";
import { DatabaseService } from "./services/db.service";
import { ProjectsService } from "./services/projects.service";
import { TasksService } from "./services/task.service";
import { WorkspaceIntegrationsService } from "./services/workspace-integrations.service";

export const appLayer = Layer.mergeAll(
  TasksService.Default,
  WorkspaceIntegrationsService.Default.pipe(
    Layer.provideMerge(ProjectsService.Default)
  )
).pipe(Layer.provideMerge(DatabaseService.Default));
