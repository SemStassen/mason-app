import { HttpApiBuilder, HttpApiSwagger, HttpMiddleware, HttpServer } from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { ServerLayer } from "@mason/core/instrumentation";
import { Layer } from "effect";
import { MasonApiLive } from "./api";

const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiSwagger.layer({
    path: "/docs",
  })),
  Layer.provide(
    HttpApiBuilder.middlewareCors({
      allowedOrigins: [
        "http://localhost:8001",
        "http://localhost:8002",
        "http://localhost:1420",
        "tauri://localhost",
      ],
    }),
  ),
  Layer.provide(MasonApiLive.pipe(Layer.provide(ServerLayer))),
  HttpServer.withLogAddress,
  Layer.provide(BunHttpServer.layer({ port: 8001 }))
);

// Launch the server
Layer.launch(HttpLive).pipe(BunRuntime.runMain);
