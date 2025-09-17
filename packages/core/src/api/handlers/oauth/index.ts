import {
  HttpApiBuilder,
  HttpApiError,
  HttpServerResponse,
} from "@effect/platform";
import { MasonApi } from "@mason/api-contract";
import { Effect } from "effect";
import { AuthService } from "~/services/auth";

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
            Effect.catchTags({
              BetterAuthError: () => new HttpApiError.InternalServerError(),
            })
          )
        )
        .handle("GoogleCallback", ({ request }) =>
          Effect.gen(function* () {
            // This is a silly thing we have to do because the better auth handler only matches/
            // /api/auth/callback/${provider_id}
            const betterAuthUrl = request.url.replace(
              "/api/oauth/google/callback",
              "http://localhost:8002/api/auth/callback/google"
            );

            const response = yield* auth.use((client) =>
              client.handler(
                new Request(betterAuthUrl, {
                  method: "GET",
                  headers: new Headers(request.headers),
                })
              )
            );

            const location = response.headers.get("Location");
            const setCookie =
              response.headers.get("set-cookie") ||
              response.headers.get("Set-Cookie");

            if (!location) {
              return yield* Effect.fail(new HttpApiError.InternalServerError());
            }

            return yield* HttpServerResponse.empty({
              status: 302,
              headers: {
                Location: location,
                ...(setCookie ? { "set-cookie": setCookie } : {}),
              },
            });
          }).pipe(
            Effect.tapError((error) =>
              Effect.logError({ message: "GoogleCallback failed", error })
            ),
            Effect.catchTags({
              BetterAuthError: () => new HttpApiError.InternalServerError(),
            })
          )
        );
    })
);
