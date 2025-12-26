import { Layer } from "effect";
import { IntegrationModuleService } from "./integration-module.service";
import { WorkspaceIntegrationRepository } from "./workspace-integration.repo";

export * from "./dto";
export * from "./errors";
export { IntegrationModuleService } from "./integration-module.service";

// Module composition
export const IntegrationModuleLive = IntegrationModuleService.live.pipe(
  Layer.provide(WorkspaceIntegrationRepository.live)
);
