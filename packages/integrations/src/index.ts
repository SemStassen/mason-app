import type { CreateProjectRequest } from "@mason/api-contract/dto/project.dto";
import { Context, type Effect, Layer } from "effect";
import { type FloatIntegrationError, floatLive } from "./float";

type IntegrationError = FloatIntegrationError;

export class TimeTrackingIntegrationService extends Context.Tag(
  "@mason/integrations/TimeTracking"
)<
  TimeTrackingIntegrationService,
  {
    readonly listProjects: Effect.Effect<
      Array<typeof CreateProjectRequest.Type>,
      IntegrationError
    >;
  }
>() {
  static floatLive = Layer.succeed(TimeTrackingIntegrationService, floatLive);
}
