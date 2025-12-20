import {
  HttpApiBuilder,
  HttpApiError,
  HttpServerResponse,
} from "@effect/platform";
import { MasonApi } from "@mason/api-contract";
import { AuthService } from "@mason/core/services/auth.service";
import { Effect } from "effect";

export const OAuthGroupLive = HttpApiBuilder.group(
  MasonApi,
  "OAuth",
  (handlers) =>
    Effect.gen(function* () {
      const auth = yield* AuthService;
      return handlers
        .handle("SignInWithGoogle", ({ payload, request }) =>
          Effect.gen(function* () {
            const response = yield* auth.use((client) =>
              client.api.signInSocial({
                body: {
                  provider: "google",
                  callbackURL:
                    payload.platform === "web"
                      ? "http://localhost:8002"
                      : "mason://",
                },
                headers: new Headers(request.headers),
              })
            );

            return { url: response.url as string };
          }).pipe(
            Effect.tapError((e) => Effect.logError(e)),
            Effect.mapError(() => new HttpApiError.InternalServerError())
          )
        )
        .handle("GoogleCallback", ({ request }) =>
          Effect.gen(function* () {

            const url = new URL(request.url, "http://placeholder-base-url.com");

            const response = yield* auth.use((client) =>
              client.api.callbackOAuth({
                method: "GET",
                params: {
                  id: "google"
                },
                headers: new Headers(request.headers),
                query: {
                  code: url.searchParams.get("code") ?? undefined ,
                  state: url.searchParams.get("state") ?? undefined ,
                  device_id: url.searchParams.get("device_id") ?? undefined ,
                  user: url.searchParams.get("authuser") ?? undefined ,
                },
                returnHeaders: true,
              })
            );

            return yield* HttpServerResponse.empty({
              status: 302,
              headers: {
                ...auth.headersToObject(response.headers),
              },
            });
          }).pipe(
            Effect.tapError((e) => Effect.logError(e)),
            Effect.mapError(() => new HttpApiError.InternalServerError())
          )
        );
    })
);
