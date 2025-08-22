import { HttpApiError, HttpApiMiddleware } from '@effect/platform';
import { Context, Effect, Layer, Schema } from 'effect';
import { User } from '~/models/user.model';
import { DatabaseService } from '~/services/db';

class RequestContextProvides extends Schema.Struct({
  user: User.pick('id'),
}) {}

class RequestContext extends Context.Tag('RequestContext')<
  RequestContext,
  RequestContextProvides
>() {}

class AuthorizationWithoutWorkspaceMiddleware extends HttpApiMiddleware.Tag<AuthorizationWithoutWorkspaceMiddleware>()(
  'AuthorizationWithoutWorkspaceMiddleware',
  {
    failure: HttpApiError.Unauthorized,
    provides: RequestContext,
  }
) {}

const AuthorizationWithoutWorkspaceMiddlewareLive = Layer.effect(
  AuthorizationWithoutWorkspaceMiddleware,
  Effect.gen(function* () {
    const db = yield* DatabaseService;
  })
);
