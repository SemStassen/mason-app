import {
  HttpRouter,
  HttpServerRequest,
  HttpServerResponse,
} from '@effect/platform';
import { Effect } from 'effect';
import { AuthService, BetterAuthError } from '~/services/auth';

// Handle GitHub OAuth callback
const githubCallback = Effect.gen(function* () {
  const auth = yield* AuthService;
  const request = yield* HttpServerRequest.HttpServerRequest;

  // Let BetterAuth handle the OAuth callback
  const response = yield* auth.use((client) =>
    client.handler(
      new Request(request.url, {
        method: 'GET',
        headers: request.headers,
      })
    )
  );

  // BetterAuth returns a Response with Set-Cookie headers and redirect
  const location = response.headers.get('Location');
  const setCookie = response.headers.get('Set-Cookie');

  if (!location) {
    return yield* Effect.fail(
      new BetterAuthError({
        cause: 'Missing redirect location from OAuth callback',
      })
    );
  }

  // Create response with cookies and redirect
  return HttpServerResponse.empty({
    status: 302,
    headers: {
      Location: location,
      ...(setCookie && { 'Set-Cookie': setCookie }),
    },
  });
});

// Auth callback routes
export const authCallbackRoutes = HttpRouter.empty.pipe(
  HttpRouter.get('/auth/callback/github', githubCallback),
  HttpRouter.catchAll(() =>
    Effect.succeed(
      HttpServerResponse.text('Auth callback not found', { status: 404 })
    )
  )
);
