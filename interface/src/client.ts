import { FetchHttpClient, HttpApiClient } from '@effect/platform';
import { MasonApi } from '@mason/api-contract';
import { Effect } from 'effect';
import { useMemo } from 'react';
import { router } from '.';
import { type Platform, usePlatform } from './utils/Platform';

export function createMasonClient(platform: Platform) {
  const client = Effect.runSync(
    HttpApiClient.make(MasonApi, { baseUrl: 'http://localhost:8002' }).pipe(
      Effect.provide(FetchHttpClient.layer),
      platform.platform === 'desktop'
        ? Effect.provideService(
            FetchHttpClient.Fetch,
            platform.fetch as typeof fetch
          )
        : (eff) => eff
    )
  );

  return {
    ...client,
    OAuth: {
      ...client.OAuth,
      SignInWithGoogle: () =>
        client.OAuth.SignInWithGoogle({
          payload: { platform: platform.platform },
        }).pipe(
          Effect.flatMap(({ url }) =>
            platform.platform === 'web'
              ? Effect.sync(() => router.navigate({ href: url }))
              : Effect.promise(() => platform.openUrl(url))
          )
        ),
    },
  };
}

export function useMasonClient(): ReturnType<typeof createMasonClient> {
  const platform = usePlatform();
  return useMemo(() => createMasonClient(platform), [platform]);
}
