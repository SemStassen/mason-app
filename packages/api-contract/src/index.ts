import { HttpApi } from '@effect/platform';
import { AuthGroup } from './groups/auth';
import { OAuthGroup } from './groups/o-auth';
import { PingGroup } from './groups/ping';
import { WorkspaceGroup } from './groups/workspace';

export const MasonApi = HttpApi.make('MasonApi')
  .add(PingGroup)
  .add(AuthGroup.prefix('/auth'))
  .add(OAuthGroup.prefix('/oauth'))
  .add(WorkspaceGroup.prefix('/workspace'))
  .prefix('/api');
