import { FetchHttpClient, HttpApiClient } from "@effect/platform";
import { AtomHttpApi } from "@effect-atom/atom-react";
import { MasonApi } from "@mason/api-contract";
import { Effect, Layer, Match } from "effect";
import { useMemo } from "react";
import { router } from ".";
import { PLATFORM } from "./utils/constants";

const MasonHttpClient = FetchHttpClient.layer.pipe(
  Layer.provide(
    Layer.effect(
      FetchHttpClient.Fetch,
      Effect.sync(() =>
        PLATFORM.platform === "desktop" ? PLATFORM.fetch : fetch
      )
    )
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

export function createMasonClient() {
  const client = Effect.runSync(
    HttpApiClient.make(MasonApi, {
      baseUrl: "http://localhost:8002",
    }).pipe(Effect.provide(FetchHttpClient.layer))
  );

  return {
    ...client,
    OAuth: {
      ...client.OAuth,
      SignInWithGoogle: () =>
        client.OAuth.SignInWithGoogle({
          payload: { platform: PLATFORM.platform },
        }).pipe(
          Effect.flatMap(({ url }) =>
            Match.value(PLATFORM).pipe(
              Match.when({ platform: "desktop" }, (platform) =>
                Effect.promise(() => platform.openUrl(url))
              ),
              Match.orElse(() =>
                Effect.sync(() => router.navigate({ href: url }))
              )
            )
          )
        ),
    },
  };
}

export function useMasonClient(): ReturnType<typeof createMasonClient> {
  return useMemo(() => createMasonClient(), []);
}
