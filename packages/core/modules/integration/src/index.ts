import { Layer } from "effect";
import { WorkspaceIntegrationRepository } from "./infra/workspace-integration.repo";
import { IntegrationModuleService } from "./integration-module.service";

export { WorkspaceIntegration } from "./domain/workspace-integration/model";
export * from "./dto";
export * from "./errors";
export { IntegrationModuleService } from "./integration-module.service";

// Module composition
export const IntegrationModuleLive = IntegrationModuleService.live.pipe(
  Layer.provide(WorkspaceIntegrationRepository.live)
);
