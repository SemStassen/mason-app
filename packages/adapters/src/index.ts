import { Layer, Schema } from "effect";
import { TimeTrackingIntegrationAdapter as TimeTrackingIntegrationAdapterBase } from "./adapter";
import { floatLive } from "./float";

export * from "./errors";

export class MissingIntegrationAdapterError extends Schema.TaggedError<MissingIntegrationAdapterError>()(
  "adapters/MissingIntegrationAdapterError",
  {
    cause: Schema.Unknown,
  }
) {}

export class TimeTrackingIntegrationAdapter extends TimeTrackingIntegrationAdapterBase {
  static getLayer(provider: "float") {
    switch (provider) {
      case "float":
        return floatLive;
      default:
        /** This should basically never happen */
        return Layer.fail(
          new MissingIntegrationAdapterError({
            cause: `Integration adapter for provider "${provider}" is not supported`,
          })
        );
    }
  }
}
