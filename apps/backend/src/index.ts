import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { IdentityModuleLayer } from "@mason/core/modules/identity";
import { IntegrationModuleLayer } from "@mason/core/modules/integration";
import { ProjectModuleLayer } from "@mason/core/modules/project";
import { TimeModuleLayer } from "@mason/core/modules/time";
import { WorkspaceModuleLayer } from "@mason/core/modules/workspace";
import { WorkspaceInvitationModuleLayer } from "@mason/core/modules/workspace-invitation";
import { WorkspaceMemberModuleLayer } from "@mason/core/modules/workspace-member";
import {
  SessionRepositoryLayer,
  UserRepositoryLayer,
} from "@mason/core-server/modules/identity";
import { WorkspaceIntegrationRepositoryLayer } from "@mason/core-server/modules/integration";
import {
  ProjectRepositoryLayer,
  TaskRepositoryLayer,
} from "@mason/core-server/modules/project";
import { TimeEntryRepositoryLayer } from "@mason/core-server/modules/time";
import { WorkspaceRepositoryLayer } from "@mason/core-server/modules/workspace";
import { WorkspaceInvitationRepositoryLayer } from "@mason/core-server/modules/workspace-invitation";
import { WorkspaceMemberRepositoryLayer } from "@mason/core-server/modules/workspace-member";

import { Drizzle } from "@mason/db";
import { Config, Layer } from "effect";
import { HttpRouter } from "effect/unstable/http";
import { RpcSerialization, RpcServer } from "effect/unstable/rpc";
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
).pipe(Layer.provide(Drizzle.layer));

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

const AllRoutesLayer = Layer.mergeAll(RpcRouteLayer);

const MainLayer = Layer.mergeAll(
  ModulesLayer.pipe(Layer.provideMerge(RepositoriesLayer))
);

const ServerLayer = HttpRouter.serve(AllRoutesLayer).pipe(
  Layer.provide(MainLayer),
  Layer.provide(
    BunHttpServer.layerConfig(
      Config.all({
        port: Config.number("PORT"),
        idleTimeout: Config.succeed(120),
      })
    )
  )
);

ServerLayer.pipe(Layer.launch, BunRuntime.runMain);
