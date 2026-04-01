import { BunHttpClient, BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { BetterAuth, RequestContextResolver } from "@mason/auth";
import { getAllowedOrigins } from "@mason/core/shared/config";
import {
  SessionRepositoryLayer,
  UserRepositoryLayer,
} from "@mason/core-server/modules/identity";
import { WorkspaceRepositoryLayer } from "@mason/core-server/modules/workspace";
import { WorkspaceMemberRepositoryLayer } from "@mason/core-server/modules/workspace-member";
import { DatabaseLayer } from "@mason/db";
import { Mailer } from "@mason/notifications/mailer";
import { makeObservabilityLayer } from "@mason/observability";
import { Config, Layer } from "effect";
import { HttpRouter, HttpServerResponse } from "effect/unstable/http";

import { ProjectsRouteLayer } from "./routes/projects";
import { WorkspaceMembersRouteLayer } from "./routes/workspace-members";
import { WorkspacesRouteLayer } from "./routes/workspaces";

const allowedOrigins = getAllowedOrigins(process.env.FRONTEND_ORIGINS);

const HealthRouteLayer = HttpRouter.add("GET", "/health", () =>
  HttpServerResponse.json({ status: "ok" })
);

const RepositoriesLayer = Layer.mergeAll(
  SessionRepositoryLayer,
  UserRepositoryLayer,
  WorkspaceMemberRepositoryLayer,
  WorkspaceRepositoryLayer
).pipe(Layer.provideMerge(DatabaseLayer));

const RequestContextLayer = RequestContextResolver.layer.pipe(
  Layer.provideMerge(BetterAuth.layer),
  Layer.provideMerge(Mailer.layerDev),
  Layer.provideMerge(RepositoriesLayer)
);

const allRoutesLayer = Layer.mergeAll(
  HealthRouteLayer,
  WorkspacesRouteLayer,
  WorkspaceMembersRouteLayer,
  ProjectsRouteLayer
).pipe(
  Layer.provide(
    HttpRouter.cors({
      allowedOrigins,
      allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    })
  )
);

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
