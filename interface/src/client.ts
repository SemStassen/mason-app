import { FetchHttpClient, HttpApiClient } from "@effect/platform";
import { AtomHttpApi } from "@effect-atom/atom-react";
import { MasonApi } from "@mason/api-contract";
import { Effect, Layer, Match } from "effect";
import { PLATFORM } from "./utils/constants";

const MasonHttpClient = FetchHttpClient.layer.pipe(
  Layer.provide(
    Layer.effect(
      FetchHttpClient.Fetch,
      Effect.sync(() => {
        const baseFetch =
          PLATFORM.platform === "desktop" ? PLATFORM.fetch : fetch;

        return (input: RequestInfo | URL, init?: RequestInit) => {
          const token = localStorage.getItem("mason-bearer-token");
          const headers = new Headers(init?.headers);

          if (token) {
            headers.set("Authorization", `Bearer ${token}`);
          }

          return baseFetch(input, {
            ...init,
            headers,
          });
        };
      })
    )
  )
);

export class MasonAtomClient extends AtomHttpApi.Tag<MasonAtomClient>()(
  "MasonAtomClient",
  {
    api: MasonApi,
    baseUrl: "http://localhost:8002",
    httpClient: MasonHttpClient,
  }
) {}

export const MasonClient = Effect.runSync(
  HttpApiClient.make(MasonApi, {
    baseUrl: "http://localhost:8002",
  }).pipe(
    Effect.provide(MasonHttpClient),
    Effect.map((client) => ({
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
                  Effect.sync(() => {
                    window.location.href = url;
                  })
                )
              )
            )
          ),
      },
    }))
  )
);
