import { FetchHttpClient, HttpApiClient } from "@effect/platform";
import { AtomHttpApi } from "@effect-atom/atom-react";
import { MasonApi } from "@mason/api-contract";
import { useRouter } from "@tanstack/react-router";
import { Effect, Layer } from "effect";
import { useMemo } from "react";
import { appLayer, router } from ".";
import { PlatformService } from "./core/services/platform";
import type { Platform } from "./utils/platform";

const MasonHttpClient = FetchHttpClient.layer.pipe(
  Layer.provide(
    Layer.effect(
      FetchHttpClient.Fetch,
      Effect.gen(function* () {
        const platform = yield* PlatformService;
        return platform.platform === "desktop"
          ? (platform.fetch as typeof fetch)
          : fetch;
      })
    ).pipe(Layer.provide(appLayer))
  )
);

class MasonAtomClient extends AtomHttpApi.Tag<MasonAtomClient>()(
  "MasonAtomClient",
  {
    api: MasonApi,
    baseUrl: "http://localhost:8002",
    httpClient: MasonHttpClient,
  }
) {}

export function createMasonClient(platform: Platform) {
  const client = Effect.runSync(
    HttpApiClient.make(MasonApi, {
      baseUrl: "http://localhost:8002",
    }).pipe(
      Effect.provide(FetchHttpClient.layer),
      // Use tauri custom fetch method for desktop apps
      platform.platform === "desktop"
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
            platform.platform === "desktop"
              ? Effect.promise(() => platform.openUrl(url))
              : Effect.sync(() => router.navigate({ href: url }))
          )
        ),
    },
  };
}

export function useMasonClient(): ReturnType<typeof createMasonClient> {
  const platform = useRouter().options.context.platform;
  return useMemo(() => createMasonClient(platform), [platform]);
}
