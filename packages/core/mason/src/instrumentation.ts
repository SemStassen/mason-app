import { NodeTelemetryLive } from "@mason/telemetry";
import { Layer } from "effect";

export const appLayer = Layer.mergeAll(NodeTelemetryLive);
