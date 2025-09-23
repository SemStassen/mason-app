import { Layer } from "effect";
import { AuthService } from "./services/auth";
import { DatabaseService } from "./services/db";
import { ProjectsService } from "./services/projects";
import { WorkspaceIntegrationsService } from "./services/workspace-integrations";

export const ServerLayer = Layer.mergeAll(
  AuthService.Default,
  WorkspaceIntegrationsService.Default.pipe(
    Layer.provideMerge(ProjectsService.Default)
  ),
  DatabaseService.Default
).pipe(Layer.provide(DatabaseService.Default));
