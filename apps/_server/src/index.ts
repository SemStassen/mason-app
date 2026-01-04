import {
  HttpApiBuilder,
  HttpApiSwagger,
  HttpMiddleware,
  HttpServer,
} from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { AppLive } from "@mason/mason/instrumentation";
import { Layer } from "effect";
import { MasonApiLive } from "./api";
import { AuthMiddlewareLive } from "./middleware/auth.middleware";

const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(
    HttpApiSwagger.layer({
      path: "/docs",
    })
  ),
  Layer.provide(
    HttpApiBuilder.middlewareCors({
      allowedOrigins: [
        "http://localhost:8001",
        "http://localhost:8002",
        "http://localhost:1420",
        "tauri://localhost",
      ],
    })
  ),
  Layer.provide(
    MasonApiLive.pipe(Layer.provide(AuthMiddlewareLive), Layer.provide(AppLive))
  ),
  HttpServer.withLogAddress,
  Layer.provide(BunHttpServer.layer({ port: 8001 }))
);

// Launch the server
Layer.launch(HttpLive).pipe(BunRuntime.runMain);
