import { HttpApiMiddleware } from '@effect/platform';
import { Context, Effect, Layer, Schema } from 'effect';
import { User } from '~/models/user.model';
import { DatabaseService } from '~/services/db';
import { UnauthorizedError } from '../contract/error';

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
    failure: UnauthorizedError,
    provides: RequestContext,
  }
) {}

const AuthorizationWithoutWorkspaceMiddlewareLive = Layer.effect(
  AuthorizationWithoutWorkspaceMiddleware,
  Effect.gen(function* () {
    const db = yield* DatabaseService;
  })
);
