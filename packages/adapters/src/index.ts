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
  static getLayer(kind: "float") {
    switch (kind) {
      case "float":
        return floatLive;
      default:
        /** This should basically never happen */
        return Layer.fail(
          new MissingIntegrationAdapterError({
            cause: `Integration adapter for kind "${kind}" is not supported`,
          })
        );
    }
  }
}
