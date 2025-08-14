import {
  HttpApiBuilder,
  HttpApiError,
  HttpServerResponse,
} from '@effect/platform';
import { Effect } from 'effect';
import { MasonApi } from '~/api/contract';
import { AuthService } from '~/services/auth';

export const AuthGroupLive = HttpApiBuilder.group(
  MasonApi,
  'Auth',
  (handlers) =>
    Effect.gen(function* () {
      const auth = yield* AuthService;
      return handlers
        .handle('GetSession', ({ request }) =>
          Effect.gen(function* () {
            const response = yield* auth.use((client) =>
              client.api.getSession({
                headers: new Headers(request.headers),
              })
            );

            if (!response?.user?.id) {
              return yield* Effect.fail(new HttpApiError.Unauthorized());
            }

            return {
              user: {
                id: response.user.id,
                email: response.user.email,
                emailVerified: response.user.emailVerified,
                displayName: response.user.name,
                imageUrl: response.user.image || null,
                activeWorkspaceId:
                  response.session.activeOrganizationId || null,
              },
            };
          }).pipe(
            Effect.catchTags({
              BetterAuthError: () => new HttpApiError.InternalServerError(),
            })
          )
        )
        .handle('SendEmailVerificationOTP', ({ payload, request }) =>
          Effect.gen(function* () {
            yield* auth.use((client) =>
              client.api.sendVerificationOTP({
                body: { email: payload.email, type: payload.type },
                headers: request.headers,
              })
            );

            return yield* HttpServerResponse.empty({ status: 200 });
          }).pipe(
            Effect.catchTags({
              BetterAuthError: () => new HttpApiError.InternalServerError(),
            })
          )
        )
        .handle('SignInWithEmailOTP', ({ payload, request }) =>
          Effect.gen(function* () {
            const response = yield* auth.use((client) =>
              client.api.signInEmailOTP({
                body: { email: payload.email, otp: payload.otp },
                headers: request.headers,
              })
            );

            return yield* HttpServerResponse.json(
              { success: true, user: response.user },
              { status: 200 }
            );
          }).pipe(
            Effect.catchTags({
              BetterAuthError: () => new HttpApiError.InternalServerError(),
              HttpBodyError: () => new HttpApiError.BadRequest(),
            })
          )
        )
        .handle('SignInWithGithub', ({ request }) =>
          Effect.gen(function* () {
            const response = yield* auth.use((client) =>
              client.api.signInSocial({
                body: { provider: 'github' },
                headers: new Headers(request.headers),
              })
            );

            return yield* HttpServerResponse.json({
              redirectUrl: response.redirect,
            });
          }).pipe(
            Effect.catchTags({
              BetterAuthError: () => new HttpApiError.InternalServerError(),
              HttpBodyError: () => new HttpApiError.BadRequest(),
            })
          )
        );
    })
);
