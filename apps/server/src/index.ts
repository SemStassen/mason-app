import { HttpApiBuilder, HttpMiddleware, HttpServer } from '@effect/platform';
import { BunHttpServer, BunRuntime } from '@effect/platform-bun';
import { Layer } from 'effect';
import { MasonApi } from '~/api/contract';
import { AuthGroupLive } from './api/handlers/auth';
import { PingGroupLive } from './api/handlers/ping';
import { WorkspaceGroupLive } from './api/handlers/workspace';
import { AuthService } from './services/auth';
import { DatabaseService } from './services/db';

const MasonApiLive = HttpApiBuilder.api(MasonApi).pipe(
  Layer.provide(PingGroupLive),
  Layer.provide(AuthGroupLive),
  Layer.provide(WorkspaceGroupLive)
);

const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provide(MasonApiLive),
  HttpServer.withLogAddress,
  Layer.provide(BunHttpServer.layer({ port: 8001 })),
  // Provide long-lived resources at the outermost level so their scope spans the server lifetime
  Layer.provide(AuthService.Default),
  Layer.provide(DatabaseService.Default)
);

// Launch the server
Layer.launch(HttpLive).pipe(BunRuntime.runMain);
