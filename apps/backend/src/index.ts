import { BunHttpClient, BunHttpServer, BunRuntime } from "@effect/platform-bun";
import {
  BetterAuth,
  BetterAuthConfig,
  RequestContextResolver,
} from "@mason/auth";
import { CryptoLayer } from "@mason/core-server/infra/crypto";
import {
  SessionRepositoryLayer,
  UserRepositoryLayer,
} from "@mason/core-server/modules/identity";
import {
  IntegrationModuleLayer,
  WorkspaceIntegrationRepositoryLayer,
} from "@mason/core-server/modules/integration";
import {
  ProjectRepositoryLayer,
  TaskRepositoryLayer,
} from "@mason/core-server/modules/project";
import { TimeEntryRepositoryLayer } from "@mason/core-server/modules/time";
import { WorkspaceRepositoryLayer } from "@mason/core-server/modules/workspace";
import { WorkspaceInvitationRepositoryLayer } from "@mason/core-server/modules/workspace-invitation";
import { WorkspaceMemberRepositoryLayer } from "@mason/core-server/modules/workspace-member";
import { Authorization } from "@mason/core-server/shared/authorization";
import {
  RpcSessionMiddlewareLayer,
  RpcWorkspaceMiddlewareLayer,
} from "@mason/core-server/shared/middleware";
import { IdentityModuleLayer } from "@mason/core/modules/identity";
import { ProjectModuleLayer } from "@mason/core/modules/project";
import { TimeModuleLayer } from "@mason/core/modules/time";
import { WorkspaceModuleLayer } from "@mason/core/modules/workspace";
import { WorkspaceInvitationModuleLayer } from "@mason/core/modules/workspace-invitation";
import { WorkspaceMemberModuleLayer } from "@mason/core/modules/workspace-member";
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
import { RpcSerialization, RpcServer } from "effect/unstable/rpc";

import { HttpApiRoutesLayer } from "./http";
import { BetterAuthRoutesLayer } from "./routes/better-auth";
import { AllRpcsGroup, AllRpcsGroupLayer } from "./rpc";

const RepositoriesLayer = Layer.mergeAll(
  ProjectRepositoryLayer,
  SessionRepositoryLayer,
  TaskRepositoryLayer,
  TimeEntryRepositoryLayer,
  UserRepositoryLayer,
  WorkspaceIntegrationRepositoryLayer,
  WorkspaceInvitationRepositoryLayer,
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

const RpcMiddlewareLayer = Layer.mergeAll(
  RpcSessionMiddlewareLayer,
  RpcWorkspaceMiddlewareLayer
).pipe(Layer.provideMerge(RequestContextLayer));

const InfraLayer = Layer.mergeAll(
  CryptoLayer,
  Authorization.layer,
  RepositoriesLayer,
  RpcMiddlewareLayer
);

const ModulesLayer = Layer.mergeAll(
  IdentityModuleLayer,
  IntegrationModuleLayer,
  ProjectModuleLayer,
  TimeModuleLayer,
  WorkspaceModuleLayer,
  WorkspaceInvitationModuleLayer,
  WorkspaceMemberModuleLayer
);

const RpcRouteLayer = RpcServer.layerHttp({
  group: AllRpcsGroup,
  path: "/rpc",
  protocol: "http",
}).pipe(
  Layer.provide(RpcSerialization.layerNdjson),
  Layer.provide(AllRpcsGroupLayer)
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

const AllRoutesLayer = Layer.mergeAll(
  HealthRouteLayer,
  HttpApiRoutesLayer,
  RpcRouteLayer,
  BetterAuthRoutesLayer
).pipe(Layer.provide(CorsLayer));

const MainLayer = ModulesLayer.pipe(Layer.provideMerge(InfraLayer));

const ObservabilityLayer = makeObservabilityLayer({
  serviceName: "mason-backend",
});

const ServerLayer = HttpRouter.serve(AllRoutesLayer).pipe(
  Layer.provide(MainLayer),
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
