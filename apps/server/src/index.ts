import {
  HttpApiBuilder,
  HttpApiSwagger,
  HttpMiddleware,
  HttpServer,
} from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { appLayer } from "@mason/mason/instrumentation";
import { AuthService } from "@mason/mason/services/auth.service";
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
    MasonApiLive.pipe(
      Layer.provide(AuthMiddlewareLive),
      Layer.provide(AuthService.Default),
      Layer.provide(appLayer)
    )
  ),
  HttpServer.withLogAddress,
  Layer.provide(BunHttpServer.layer({ port: 8001 }))
);

// Launch the server
Layer.launch(HttpLive).pipe(BunRuntime.runMain);
