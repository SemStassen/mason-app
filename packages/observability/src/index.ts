import { BunSocket } from "@effect/platform-bun";
import { Config, Effect, Layer } from "effect";
import { DevTools } from "effect/unstable/devtools";
import { Otlp } from "effect/unstable/observability";

interface MakeObservabilityLayerOptions {
  serviceName: string;
}

export const makeObservabilityLayer = (
  options: MakeObservabilityLayerOptions
) =>
  Layer.unwrap(
    Effect.gen(function* () {
      const effectDevToolsEnabled = yield* Config.boolean(
        "EFFECT_DEVTOOLS_ENABLED"
      ).pipe(Config.withDefault(false));

      if (effectDevToolsEnabled) {
        const effectDevToolsUrl = yield* Config.string(
          "EFFECT_DEVTOOLS_URL"
        ).pipe(Config.withDefault("ws://localhost:34437"));

        return DevTools.layerWebSocket(effectDevToolsUrl).pipe(
          Layer.provide(BunSocket.layerWebSocketConstructor)
        );
      }

      const otlpConfig = yield* Config.all({
        baseUrl: Config.string("OTEL_EXPORTER_OTLP_ENDPOINT"),
        commitSha: Config.string("RAILWAY_GIT_COMMIT_SHA").pipe(
          Config.withDefault("unknown")
        ),
      });

      return Otlp.layerJson({
        baseUrl: otlpConfig.baseUrl,
        resource: {
          serviceName: options.serviceName,
          serviceVersion: otlpConfig.commitSha,
        },
        metricsTemporality: "cumulative",
      });
    })
  );
