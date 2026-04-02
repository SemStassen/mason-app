import { BunHttpClient, BunHttpServer, BunRuntime } from "@effect/platform-bun";
import {
  BetterAuth,
  BetterAuthConfig,
  RequestContextResolver,
} from "@mason/auth";
import {
  SessionRepositoryLayer,
  UserRepositoryLayer,
} from "@mason/core-server/modules/identity";
import { WorkspaceRepositoryLayer } from "@mason/core-server/modules/workspace";
import { WorkspaceMemberRepositoryLayer } from "@mason/core-server/modules/workspace-member";
import { matchesAllowedOrigin, parseOrigins } from "@mason/core/shared/config";
import { DatabaseLayer } from "@mason/db";
import { Mailer } from "@mason/notifications/mailer";
import { makeObservabilityLayer } from "@mason/observability";
import { Config, Effect, Layer } from "effect";
import {
  HttpMiddleware,
  HttpRouter,
  HttpServerResponse,
} from "effect/unstable/http";

import { ProjectsRouteLayer } from "./routes/projects";
import { WorkspaceMembersRouteLayer } from "./routes/workspace-members";
import { WorkspacesRouteLayer } from "./routes/workspaces";

const RepositoriesLayer = Layer.mergeAll(
  SessionRepositoryLayer,
  UserRepositoryLayer,
  WorkspaceMemberRepositoryLayer,
  WorkspaceRepositoryLayer
).pipe(Layer.provideMerge(DatabaseLayer));

const RequestContextLayer = RequestContextResolver.layer.pipe(
  Layer.provideMerge(
    BetterAuth.layer.pipe(Layer.provide(BetterAuthConfig.layer))
  ),
  Layer.provideMerge(Mailer.layerDev),
  Layer.provideMerge(RepositoriesLayer)
);

const HealthRouteLayer = HttpRouter.add("GET", "/health", () =>
  HttpServerResponse.json({ status: "ok" })
);

const allowedOrigins = Effect.runSync(
  Effect.gen(function* () {
    const frontendOrigins = yield* Config.string("FRONTEND_ORIGINS");

    return yield* parseOrigins(frontendOrigins);
  })
);

const CorsLayer = HttpRouter.middleware(
  HttpMiddleware.cors({
    allowedOrigins: (origin) => matchesAllowedOrigin(origin, allowedOrigins),
    allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
).layer;

const allRoutesLayer = Layer.mergeAll(
  HealthRouteLayer,
  WorkspacesRouteLayer,
  WorkspaceMembersRouteLayer,
  ProjectsRouteLayer
).pipe(Layer.provide(CorsLayer));

const ObservabilityLayer = makeObservabilityLayer({
  serviceName: "mason-electric-proxy",
});

const ServerLayer = HttpRouter.serve(allRoutesLayer).pipe(
  Layer.provide(RequestContextLayer),
  Layer.provide(ObservabilityLayer),
  Layer.provide(BunHttpClient.layer),
  Layer.provide(
    BunHttpServer.layerConfig(
      Config.all({
        port: Config.number("PORT"),
        idleTimeout: Config.succeed(120),
      })
    )
  )
);

Layer.launch(ServerLayer).pipe(BunRuntime.runMain);
