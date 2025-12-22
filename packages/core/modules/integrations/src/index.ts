import { Layer } from "effect";
import { IntegrationService } from "./integration.service";
import { WorkspaceIntegrationRepository } from "./repositories/workspace-integration.repo";

export * from "./dto";
export * from "./errors";
export { IntegrationService } from "./integration.service";

export const IntegrationModuleLive = IntegrationService.live.pipe(
  Layer.provide(WorkspaceIntegrationRepository.live)
);
