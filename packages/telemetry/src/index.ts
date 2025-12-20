import { NodeSdk } from "@effect/opentelemetry"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base"
import { Config, Effect } from "effect"

export const NodeTelemetryLive = Effect.runSync(
  Effect.gen(function* () {
    const endpoint = yield* Config.string("OTEL_EXPORTER_OTLP_ENDPOINT").pipe(
      Config.withDefault("http://localhost:4318"),
    )

    yield* Effect.logInfo(`Processing telemetry with endpoint: ${endpoint}`)

    return NodeSdk.layer(() => ({
      resource: {
        serviceName: "mason",
        version: "0.1.0",
        attributes: {},
      },
      spanProcessor: new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: endpoint,
        })
      ),
    }))
  })
)