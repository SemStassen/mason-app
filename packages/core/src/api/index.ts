import { HttpApiBuilder } from '@effect/platform';
import { MasonApi } from '@mason/api-contract';
import { Layer } from 'effect';
import { AuthGroupLive } from './handlers/auth';
import { OAuthGroupLive } from './handlers/oauth';
import { PingGroupLive } from './handlers/ping';
import { WorkspaceGroupLive } from './handlers/workspace';

export const MasonApiLive = HttpApiBuilder.api(MasonApi).pipe(
  Layer.provide(PingGroupLive),
  Layer.provide(AuthGroupLive),
  Layer.provide(OAuthGroupLive),
  Layer.provide(WorkspaceGroupLive)
);
