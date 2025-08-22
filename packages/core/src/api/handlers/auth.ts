import {
  HttpApiBuilder,
  HttpApiError,
  HttpServerResponse,
} from '@effect/platform';
import { MasonApi } from '@mason/api-contract';
import { Effect } from 'effect';
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
                displayName: response.user.displayName,
                imageUrl: response.user.imageUrl,
                activeWorkspaceId:
                  response.session.activeOrganizationId || null,
                activeWorkspaceSlug: response.activeWorkspaceSlug || null,
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
            const result = yield* auth.use((client) =>
              client.api.signInEmailOTP({
                body: { email: payload.email, otp: payload.otp },
                headers: request.headers,
                returnHeaders: true, // This gives you headers without changing response type
              })
            );

            return yield* HttpServerResponse.json(
              { success: true, user: result.response.user },
              {
                status: 200,
                headers: {
                  'set-cookie': result.headers.get('set-cookie') || '',
                },
              }
            );
          }).pipe(
            Effect.catchTags({
              BetterAuthError: () => new HttpApiError.InternalServerError(),
              HttpBodyError: () => new HttpApiError.BadRequest(),
            })
          )
        );
    })
);
