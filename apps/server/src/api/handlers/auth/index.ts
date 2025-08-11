import { HttpApiBuilder, HttpServerResponse } from '@effect/platform';
import { Effect } from 'effect';
import { MasonApi } from '~/api/contract';
import { InternalServerError } from '~/api/contract/error';
import { AuthService } from '~/services/auth';

export const AuthGroupLive = HttpApiBuilder.group(
  MasonApi,
  'Auth',
  (handlers) =>
    Effect.gen(function* () {
      const auth = yield* AuthService;
      return handlers
        .handle('SendEmailVerificationOTP', ({ payload, request }) =>
          Effect.gen(function* () {
            const response = yield* auth.use((client) =>
              client.api.sendVerificationOTP({
                body: { email: payload.email, type: payload.type },
                headers: request.headers,
                asResponse: true,
              })
            );

            const setCookie = response.headers.get('Set-Cookie');
            return yield* HttpServerResponse.empty({
              status: response.status,
              headers: setCookie ? { 'Set-Cookie': setCookie } : undefined,
            });
          }).pipe(
            Effect.mapError(
              () =>
                new InternalServerError({
                  code: 'INTERNAL_SERVER_ERROR',
                  status: 500,
                  message: 'Auth error',
                })
            )
          )
        )
        .handle('SignInWithEmailOTP', ({ payload, request }) =>
          Effect.gen(function* () {
            const response = yield* auth.use((client) =>
              client.api.signInEmailOTP({
                body: {
                  email: payload.email,
                  otp: payload.otp,
                },
                headers: request.headers,
                asResponse: true,
              })
            );

            const setCookie = response.headers.get('Set-Cookie');
            return yield* HttpServerResponse.empty({
              status: response.status,
              headers: setCookie ? { 'Set-Cookie': setCookie } : undefined,
            });
          }).pipe(
            Effect.mapError(
              () =>
                new InternalServerError({
                  code: 'INTERNAL_SERVER_ERROR',
                  status: 500,
                  message: 'Auth error',
                })
            )
          )
        )
        .handle('SignInWithGithub', ({ request }) =>
          Effect.gen(function* () {
            const response = yield* auth.use((client) =>
              client.api.signInSocial({
                body: { provider: 'github' },
                headers: request.headers,
                asResponse: true,
              })
            );

            const redirectUrl =
              response.headers.get('Location') ??
              response.headers.get('location');
            if (!redirectUrl) {
              const res = yield* HttpServerResponse.text(
                'Missing redirect URL',
                {
                  status: 500,
                }
              );
              return res;
            }

            return yield* HttpServerResponse.json({ redirectUrl });
          }).pipe(
            Effect.mapError(
              () =>
                new InternalServerError({
                  status: 500,
                  code: 'INTERNAL_SERVER_ERROR',
                  message: 'Auth error',
                })
            )
          )
        );
    })
);
