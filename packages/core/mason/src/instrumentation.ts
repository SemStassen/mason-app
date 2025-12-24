import { DatabaseService } from "@mason/db/service";
import { AuthService, CryptoService } from "@mason/framework";
import { IntegrationModuleLive } from "@mason/integration";
import { ProjectModuleLive } from "@mason/project";
import { NodeTelemetryLive } from "@mason/telemetry";
import { TimeTrackingModuleLive } from "@mason/time-tracking";
import { Layer } from "effect";

const ServicesLive = Layer.mergeAll(
  IntegrationModuleLive,
  ProjectModuleLive,
  TimeTrackingModuleLive
);

export const AppLive = ServicesLive.pipe(
  Layer.provideMerge(AuthService.Default),
  Layer.provideMerge(CryptoService.live),
  Layer.provideMerge(DatabaseService.live),
  Layer.provideMerge(NodeTelemetryLive)
);
