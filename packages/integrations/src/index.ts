import { Schema, Layer } from "effect";
import { InternalTimeTrackingIntegrationAdapter } from "./adapter";
import { floatLive } from "./float";

export * from "./errors";

export class MissingIntegrationAdapterError extends Schema.TaggedError<MissingIntegrationAdapterError>()(
  "@mason/integrations/missingIntegrationAdapterError",
  {
    cause: Schema.Unknown,
  }
) {}

export class TimeTrackingIntegrationAdapter extends InternalTimeTrackingIntegrationAdapter {
  static getLayer(kind: "float") {
    switch (kind) {
      case "float":
        return floatLive;
      default:
        return Layer.fail(new MissingIntegrationAdapterError({
          cause: `Integration adapter for kind "${kind}" is not supported`,
        }));
    }
  }
}