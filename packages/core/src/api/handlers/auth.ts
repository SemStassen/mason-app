import {
  HttpApiBuilder,
  HttpApiError,
  HttpServerResponse,
} from "@effect/platform";
import { MasonApi } from "@mason/api-contract";
import { Effect } from "effect";
import { UserId, WorkspaceId } from "~/models/shared";
import { AuthService } from "~/services/auth";

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

            if (!response?.user?.id) {
              return yield* Effect.fail(new HttpApiError.Unauthorized());
            }

            const activeMembership = response.session.activeOrganizationId
              ? response.user.memberships.find(
                  (membership) =>
                    String(membership.workspaceId) ===
                    String(response.session.activeOrganizationId)
                )
              : undefined;

            const activeWorkspace = activeMembership
              ? {
                  id: WorkspaceId.make(activeMembership.workspace.id),
                  slug: activeMembership.workspace.slug,
                  name: activeMembership.workspace.name,
                }
              : null;

            return {
              user: {
                id: UserId.make(response.user.id),
                email: response.user.email,
                emailVerified: response.user.emailVerified,
                displayName: response.user.displayName,
                imageUrl: response.user.imageUrl,
                workspaces: response.user.memberships.map((membership) => ({
                  id: WorkspaceId.make(membership.workspace.id),
                  slug: membership.workspace.slug,
                  name: membership.workspace.name,
                })),
                activeWorkspace: activeWorkspace,
              },
            };
          }).pipe(
            Effect.catchTags({
              BetterAuthError: () => new HttpApiError.InternalServerError(),
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
              BetterAuthError: () => new HttpApiError.InternalServerError(),
            })
          )
        )
        .handle("SignInWithEmailOTP", ({ payload, request }) =>
          Effect.gen(function* () {
            const result = yield* auth.use((client) =>
              client.api.signInEmailOTP({
                body: { email: payload.email, otp: payload.otp },
                headers: request.headers,
                returnHeaders: true, // This gives you headers without changing response type
              })
            );

            return yield* HttpServerResponse.json(
              { user: result.response.user },
              {
                headers: {
                  "set-cookie": result.headers.get("set-cookie") || "",
                },
              }
            );
          }).pipe(
            Effect.catchTags({
              BetterAuthError: () => new HttpApiError.InternalServerError(),
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
              BetterAuthError: () => new HttpApiError.InternalServerError(),
            })
          )
        );
    })
);
