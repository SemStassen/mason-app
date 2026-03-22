import { Layer } from "effect";

/**
 * Browser telemetry layer.
 *
 * Production tracing is disabled — the backend already traces all API/RPC
 * calls, so frontend spans are redundant noise that generates excessive
 * OTLP export volume per browser tab.
 */
export const TracerLayer = Layer.empty;
