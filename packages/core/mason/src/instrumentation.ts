import { Layer } from "effect";
import { NodeTelemetryLive } from "@mason/telemetry";

export const appLayer = Layer.mergeAll(
  NodeTelemetryLive,
);
