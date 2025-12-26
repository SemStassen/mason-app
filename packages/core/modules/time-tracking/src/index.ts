import { Layer } from "effect";
import { TimeEntryRepository } from "./time-entry.repo";
import { TimeTrackingModuleService } from "./time-tracking-module.service";

export * from "./dto";
export * from "./errors";
export { TimeTrackingModuleService } from "./time-tracking-module.service";

export const TimeTrackingModuleLive = TimeTrackingModuleService.live.pipe(
  Layer.provide(TimeEntryRepository.live)
);
