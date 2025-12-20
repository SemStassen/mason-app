import { Layer } from "effect";
import { DatabaseService } from "./services/db.service";
import { ProjectsService } from "./services/projects.service";
import { TasksService } from "./services/task.service";
import { WorkspaceIntegrationsService } from "./services/workspace-integrations.service";
import { NodeTelemetryLive } from "@mason/telemetry";

export const appLayer = Layer.mergeAll(
  NodeTelemetryLive,
  TasksService.Default,
  WorkspaceIntegrationsService.Default.pipe(
    Layer.provideMerge(ProjectsService.Default)
  ),
).pipe(Layer.provideMerge(DatabaseService.Default));
