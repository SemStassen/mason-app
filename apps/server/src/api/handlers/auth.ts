import {
  HttpApiBuilder,
  HttpApiError,
  HttpServerResponse,
} from "@effect/platform";
import { MasonApi } from "@mason/api-contract";
import { Effect } from "effect";
import { AuthService } from "~/auth-service";

export const AuthGroupLive = HttpApiBuilder.group(
  MasonApi,
  "Auth",
  (handlers) =>
    Effect.gen(function* () {
      const auth = yield* AuthService;
      return handlers
        .handle("GetSession", ({ request }) =>
          Effect.gen(function* () {
            const response = yield* auth.use((client) =>
              client.api.getSession({
                headers: new Headers(request.headers),
              })
            );

            yield* Effect.log({ response });

            if (!response?.user) {
              return yield* Effect.fail(new HttpApiError.Unauthorized());
            }

            return {
              session: {
                id: response.session.id,
                activeWorkspaceId: response.session.activeWorkspaceId,
              },
              user: {
                id: response.user.id,
                displayName: response.user.displayName,
                email: response.user.email,
                imageUrl: response.user.imageUrl,
                memberships: response.user.memberships.map((membership) => ({
                  role: membership.role,
                  workspace: {
                    id: membership.workspace.id,
                    name: membership.workspace.name,
                    slug: membership.workspace.slug,
                  },
                })),
              },
            };
          }).pipe(
            Effect.tapError((e) => Effect.logError({ error: e })),
            Effect.catchTags({
              "@mason/server/betterAuthError": () => {
                return new HttpApiError.InternalServerError();
              },
            })
          )
        )
        .handle("SendEmailVerificationOTP", ({ payload, request }) =>
          Effect.gen(function* () {
            yield* auth.use((client) =>
              client.api.sendVerificationOTP({
                body: { email: payload.email, type: payload.type },
                headers: request.headers,
              })
            );

            return yield* HttpServerResponse.empty();
          }).pipe(
            Effect.catchTags({
              "@mason/server/betterAuthError": () =>
                new HttpApiError.InternalServerError(),
            })
          )
        )
        .handle("SignInWithEmailOTP", ({ payload, request }) =>
          Effect.gen(function* () {
            const result = yield* auth.use((client) =>
              client.api.signInEmailOTP({
                body: { email: payload.email, otp: payload.otp },
                headers: request.headers,
                returnHeaders: true,
              })
            );

            return yield* HttpServerResponse.json(
              { user: result.response.user },
              {
                headers: auth.headersToObject(result.headers),
              }
            );
          }).pipe(
            Effect.catchTags({
              "@mason/server/betterAuthError": () =>
                new HttpApiError.InternalServerError(),
              HttpBodyError: () => new HttpApiError.BadRequest(),
            })
          )
        )
        .handle("SignOut", ({ request }) =>
          Effect.gen(function* () {
            const result = yield* auth.use((client) =>
              client.api.signOut({
                headers: request.headers,
                returnHeaders: true,
              })
            );

            return yield* HttpServerResponse.empty({
              headers: {
                "set-cookie": result.headers.get("set-cookie") || "", // clears session cookie(s)
                "cache-control": "no-store",
              },
            });
          }).pipe(
            Effect.catchTags({
              "@mason/server/betterAuthError": () =>
                new HttpApiError.InternalServerError(),
            })
          )
        );
    })
);
